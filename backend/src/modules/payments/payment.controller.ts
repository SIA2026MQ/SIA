import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../../core/services/db.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { sendEmail } from '../../core/services/mail.service';
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// -----------------------------------------------------------------------------
// 1. [AUTHENTICATED] Create an order (Handles Pay-What-You-Want)
// -----------------------------------------------------------------------------
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId, itemType, customAmountInr } = req.body;

    const userCustomAmount = customAmountInr ? Number(customAmountInr) : null;
    let finalPrice = 0;

    if (itemType === 'COURSE') {
      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
      finalPrice = course.priceInr;

    } else if (itemType === 'WEBINAR') {
      const webinar = await prisma.webinar.findUnique({ where: { id: itemId } });
      if (!webinar) { res.status(404).json({ error: 'Webinar not found' }); return; }

      finalPrice = webinar.minPriceInr;
      if (userCustomAmount) {
        if (userCustomAmount < webinar.minPriceInr) {
          res.status(400).json({ error: 'Amount is below the minimum required price.' }); return;
        }
        finalPrice = userCustomAmount;
      }

    } else if (itemType === 'SUBSCRIPTION') {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: itemId } });
      if (!plan) { res.status(404).json({ error: 'Subscription Plan not found' }); return; }

      finalPrice = plan.minPriceInr;
      if (userCustomAmount) {
        if (userCustomAmount < plan.minPriceInr) {
          res.status(400).json({ error: 'Amount is below the minimum required price.' }); return;
        }
        finalPrice = userCustomAmount;
      }

    } else if (itemType === 'RETREAT') {
      const retreat = await prisma.retreat.findUnique({ where: { id: itemId } });
      if (!retreat) { res.status(404).json({ error: 'Retreat not found' }); return; }
      
      finalPrice = retreat.priceInr;
    } else {
      res.status(400).json({ error: 'Invalid item type' }); return;
    }

    const options = {
      amount: finalPrice * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${userId.substring(0, 5)}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = await prisma.order.create({
      data: {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: finalPrice,
        currency: 'INR',
        itemType,
        itemId,
        status: 'PENDING',
      },
    });

    res.status(200).json({
      message: 'Order created successfully',
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder.id,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// 2. [AUTHENTICATED] Verify Payment & Grant Access (Browser Callback)
// -----------------------------------------------------------------------------
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;
    const userId = req.user!.id;

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await prisma.order.update({ where: { id: dbOrderId }, data: { status: 'FAILED' } });
      res.status(400).json({ error: 'Invalid signature' }); return;
    }

    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order || order.userId !== userId || order.razorpayOrderId !== razorpay_order_id) {
      res.status(403).json({ error: 'Invalid order parameters. Security mismatch.' }); return;
    }

    if (order.status === 'SUCCESS') {
      res.status(200).json({ message: 'Payment already verified.', success: true }); return;
    }

    await handleSuccessfulPayment(order.id, razorpay_payment_id);

    res.status(200).json({ message: 'Payment verified! Access granted.', success: true });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// 3. [PUBLIC] Razorpay Server-to-Server Webhook
// -----------------------------------------------------------------------------
export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    const isValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );

    if (!isValid) {
      res.status(400).json({ error: 'Invalid Webhook Signature' }); return;
    }

    if (req.body.event === 'payment.captured') {
      const paymentData = req.body.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;

      const order = await prisma.order.findUnique({ where: { razorpayOrderId } });

      if (order && order.status === 'PENDING') {
        await handleSuccessfulPayment(order.id, paymentData.id);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// -----------------------------------------------------------------------------
// UTILITY: Shared Logic to Grant Access (Idempotent)
// -----------------------------------------------------------------------------
const handleSuccessfulPayment = async (dbOrderId: string, razorpayPaymentId: string) => {
  const order = await prisma.order.update({
    where: { id: dbOrderId },
    data: { status: 'SUCCESS', razorpayPaymentId },
    include: { user: true } // 🚨 CRITICAL: We need the user data to get their email!
  });

  if (order.itemType === 'COURSE') {
    await prisma.courseAccess.upsert({
      where: { userId_courseId: { userId: order.userId, courseId: order.itemId } },
      update: { orderId: order.id },
      create: { userId: order.userId, courseId: order.itemId, orderId: order.id },
    });
  }
  else if (order.itemType === 'WEBINAR') {
    await prisma.webinarAccess.upsert({
      where: { userId_webinarId: { userId: order.userId, webinarId: order.itemId } },
      update: { orderId: order.id },
      create: { userId: order.userId, webinarId: order.itemId, orderId: order.id },
    });
  }
  else if (order.itemType === 'RETREAT') {
    // 1. Update Database Status to PAID
    await prisma.retreatApplication.updateMany({
      where: { userId: order.userId, retreatId: order.itemId },
      data: { status: 'PAID', orderId: order.id }
    });

    // 2. Fetch Retreat Details to put in the email
    const retreat = await prisma.retreat.findUnique({ where: { id: order.itemId } });

    // 3. Send "Seat Confirmed" Email
    if (retreat && order.user?.email) {
      const subject = `Payment Confirmed: Seat secured for ${retreat.title}!`;
      const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #16a34a;">Payment Successful! ✅</h2>
          <p>Hi ${order.user.name},</p>
          <p>We have successfully received your payment of <strong>₹${order.amount}</strong>.</p>
          <p>Your seat for the <strong>${retreat.title}</strong> retreat is officially confirmed! We will share further details regarding the itinerary and packing list soon.</p>
          <p>See you there,<br/>The SIA Team</p>
        </div>
      `;

      try {
        await sendEmail(order.user.email, subject, htmlBody);
        console.log(`Retreat confirmation email sent to ${order.user.email}`);
      } catch (emailError) {
        console.error("Payment recorded, but email failed to send:", emailError);
      }
    }
  }
  else if (order.itemType === 'SUBSCRIPTION') {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: order.itemId } });
    if (plan) {
      const isTopUp = plan.name.toLowerCase().includes('webinar');

      const existingSub = await prisma.userSubscription.findUnique({ where: { userId: order.userId } });

      if (isTopUp && existingSub) {
        await prisma.userSubscription.update({
          where: { userId: order.userId },
          data: {
            remainingCredits: existingSub.remainingCredits + plan.webinarCredits,
            isActive: true, 
          }
        });
      } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.durationDays > 0 ? plan.durationDays : 365)); 

        await prisma.userSubscription.upsert({
          where: { userId: order.userId },
          update: {
            planId: isTopUp ? existingSub?.planId || plan.id : plan.id, 
            orderId: order.id,
            remainingCredits: existingSub ? existingSub.remainingCredits + plan.webinarCredits : plan.webinarCredits, 
            expiryDate: isTopUp ? existingSub?.expiryDate || expiryDate : expiryDate, 
            isActive: true,
          },
          create: {
            userId: order.userId,
            planId: plan.id,
            orderId: order.id,
            remainingCredits: plan.webinarCredits,
            expiryDate: expiryDate,
            isActive: true,
          },
        });
      }
    }
  }
};

// -----------------------------------------------------------------------------
// 4. [AUTHENTICATED] Direct Cart Checkout Bypass
// -----------------------------------------------------------------------------
export const checkoutCartBypass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    for (const item of items) {
      const dummyOrderId = `bypass_${userId.substring(0, 5)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await prisma.courseAccess.upsert({
        where: { userId_courseId: { userId, courseId: item.id } },
        update: {},
        create: { 
          userId, 
          courseId: item.id, 
          orderId: dummyOrderId 
        },
      });
    }

    res.status(200).json({ message: 'Cart checkout successful! Access granted.', success: true });
  } catch (error) {
    console.error('Cart Checkout Error:', error);
    res.status(500).json({ error: 'Internal server error during cart checkout' });
  }
};

// Inside your existing payment.controller.ts -> createUnifiedOrder
export const createUnifiedOrder = async (req: AuthRequest, res: Response) => {
  const { itemId, itemType, couponId } = req.body; // Add couponId here

  // ... (Your existing logic to find the item and get base price) ...
  let finalPriceInr = basePriceInr;

  // 🚨 NEW: Apply the math if a coupon is provided
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses) {
      const discountAmount = (finalPriceInr * coupon.discountPercent) / 100;
      finalPriceInr = finalPriceInr - discountAmount;
    }
  }

  // Create Razorpay Order with the NEW discounted finalPriceInr
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(finalPriceInr * 100), // Razorpay uses paise
    currency: "INR",
  });

  // Save the Order in the DB, attaching the couponId
  const dbOrder = await prisma.order.create({
    data: {
      userId: req.user!.id,
      razorpayOrderId: razorpayOrder.id,
      amount: finalPriceInr,
      currency: "INR",
      status: 'PENDING',
      itemType,
      itemId,
      couponId: couponId || null, // 🚨 Track the coupon usage!
    }
  });
  
  // ... (Return response)
}