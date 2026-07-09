import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import geoip from 'geoip-lite';
import { prisma } from '../../core/services/db.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { sendEmail } from '../../core/services/mail.service';
import { getCountryFromIP } from '../../utils/geo';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// -----------------------------------------------------------------------------
// 1. [AUTHENTICATED] Create an order (Handles Regional Pricing & Free Coupons)
// -----------------------------------------------------------------------------
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // 🚨 ZERO-TRUST PRICING: We only accept itemId, itemType, and couponId.
    // We DO NOT accept the amount OR the currency from the frontend.
    const { itemId, itemType, couponId } = req.body;

    // 🌍 ZERO‑TRUST GEOLOCATION – uses secure server‑side IP detection
    const ipCountry = getCountryFromIP(req);
    const requestedCurrency = ipCountry === 'IN' ? 'INR' : 'USD';

    let basePrice = 0;

    // 1. SECURE FETCH: Get the exact price from the database based on detected country
    if (itemType === 'COURSE') {
      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
      basePrice = requestedCurrency === 'USD' ? course.priceUsd : course.priceInr;
    }
    else if (itemType === 'WEBINAR') {
      const webinar = await prisma.webinar.findUnique({ where: { id: itemId } });
      if (!webinar) { res.status(404).json({ error: 'Webinar not found' }); return; }
      basePrice = requestedCurrency === 'USD' ? webinar.minPriceUsd : webinar.minPriceInr;
    }
    else if (itemType === 'SUBSCRIPTION') {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: itemId } });
      if (!plan) { res.status(404).json({ error: 'Subscription Plan not found' }); return; }
      basePrice = requestedCurrency === 'USD' ? plan.minPriceUsd : plan.minPriceInr;
    }
    else if (itemType === 'RETREAT') {
      const retreat = await prisma.retreat.findUnique({ where: { id: itemId } });
      if (!retreat) { res.status(404).json({ error: 'Retreat not found' }); return; }
      // Retreats schema only has priceInr, applying a rough conversion fallback if USD requested
      basePrice = requestedCurrency === 'USD' ? Math.round(retreat.priceInr / 80) : retreat.priceInr;
    }
    else {
      res.status(400).json({ error: 'Invalid item type' }); return;
    }

    let finalPrice = basePrice;

    // 2. APPLY COUPON DISCOUNT SECURELY ON BACKEND
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

      if (!coupon || !coupon.isActive) {
        res.status(400).json({ error: 'Invalid or inactive coupon.' }); return;
      }
      if (coupon.usedCount >= coupon.maxUses) {
        res.status(400).json({ error: 'Coupon usage limit reached.' }); return;
      }
      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        res.status(400).json({ error: 'Coupon has expired.' }); return;
      }

      const discountAmount = (finalPrice * coupon.discountPercent) / 100;
      finalPrice = Math.max(0, finalPrice - discountAmount);
    }

    // 3. 100% FREE TRANSACTION BYPASS (Skips Razorpay entirely)
    if (finalPrice <= 0) {
      const dummyId = `free_${userId.substring(0, 5)}_${Date.now()}`;

      const freeOrder = await prisma.order.create({
        data: {
          userId,
          razorpayOrderId: dummyId,
          amount: 0,
          currency: requestedCurrency,
          itemType,
          itemId,
          couponId: couponId || null,
          status: 'PENDING',
        },
      });

      // Grant access immediately
      await handleSuccessfulPayment(freeOrder.id, dummyId);

      res.status(200).json({
        message: '100% Free access granted',
        freeTransaction: true,
        dbOrderId: freeOrder.id,
      });
      return;
    }

    // 4. NORMAL RAZORPAY FLOW (For amounts > 0)
    const options = {
      amount: Math.round(finalPrice * 100), // Razorpay expects paise/cents
      currency: requestedCurrency,
      receipt: `rcpt_${userId.substring(0, 5)}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = await prisma.order.create({
      data: {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: finalPrice,
        currency: requestedCurrency,
        itemType,
        itemId,
        couponId: couponId || null,
        status: 'PENDING',
      },
    });

    res.status(200).json({
      message: 'Order created successfully',
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder.id,
      freeTransaction: false
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

    // 1. Verify cryptographic signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await prisma.order.update({ where: { id: dbOrderId }, data: { status: 'FAILED' } });
      res.status(400).json({ error: 'Invalid signature' }); return;
    }

    // 2. Verify order ownership and existence
    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order || order.userId !== userId || order.razorpayOrderId !== razorpay_order_id) {
      res.status(403).json({ error: 'Invalid order parameters. Security mismatch.' }); return;
    }

    // 🚨 3. IDEMPOTENCY CHECK: If order already succeeded, just return success
    if (order.status === 'SUCCESS') {
      res.status(200).json({ message: 'Payment already verified.', success: true }); return;
    }

    // 4. Transition to SUCCESS atomically (see handleSuccessfulPayment)
    const success = await handleSuccessfulPayment(order.id, razorpay_payment_id);
    if (!success) {
      // This means another process (webhook) already processed it
      res.status(200).json({ message: 'Payment already verified.', success: true }); return;
    }

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

    // Handle only payment.captured events
    if (req.body.event === 'payment.captured') {
      const paymentData = req.body.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;
      const razorpayPaymentId = paymentData.id;

      // Fetch the order from DB
      const order = await prisma.order.findUnique({ where: { razorpayOrderId } });

      if (!order) {
        console.warn(`Webhook: No order found for razorpayOrderId ${razorpayOrderId}`);
        res.status(200).json({ status: 'ok' }); // Acknowledge to prevent retries
        return;
      }

      // 🚨 1. IDEMPOTENCY: If already SUCCESS, do nothing
      if (order.status === 'SUCCESS') {
        res.status(200).json({ status: 'ok' });
        return;
      }

      // 🚨 2. SECURITY: Validate that the payment amount and currency match the order
      const paymentAmount = Number(paymentData.amount); // in paise/cents
      const orderAmountInSmallestUnit = Math.round(order.amount * 100);
      if (paymentAmount !== orderAmountInSmallestUnit || paymentData.currency !== order.currency) {
        console.error(
          `Webhook amount/currency mismatch for order ${order.id}: ` +
          `expected ${orderAmountInSmallestUnit} ${order.currency}, got ${paymentAmount} ${paymentData.currency}`
        );
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        });
        res.status(400).json({ error: 'Payment data does not match order' });
        return;
      }

      // 3. Process the success (idempotently)
      await handleSuccessfulPayment(order.id, razorpayPaymentId);
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
const handleSuccessfulPayment = async (dbOrderId: string, razorpayPaymentId: string): Promise<boolean> => {
  // 💡 Use a transaction to ensure that status change and access grant happen atomically
  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch current order state with row lock (FOR UPDATE) – not directly supported in Prisma,
    //    but we can use a conditional update that only succeeds if status is still PENDING.
    const order = await tx.order.findUnique({ where: { id: dbOrderId }, include: { user: true } });

    if (!order) {
      throw new Error('Order not found');
    }

    // If already SUCCESS, abort (idempotent)
    if (order.status === 'SUCCESS') {
      return false; // signal that no work was done
    }

    // 2. Atomically update the order to SUCCESS only if it's currently PENDING
    const updatedOrder = await tx.order.updateMany({
      where: { id: dbOrderId, status: 'PENDING' },
      data: { status: 'SUCCESS', razorpayPaymentId }
    });

    if (updatedOrder.count === 0) {
      // Another process already updated it – this is safe idempotency
      return false;
    }

    // 3. Increment coupon usage (if applicable) – only once because we're inside the transaction
    //    and we know this is the first successful processing.
    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // 4. Grant access based on item type (same logic, but now using the transaction client)
    if (order.itemType === 'COURSE') {
      await tx.courseAccess.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.itemId } },
        update: { orderId: order.id },
        create: { userId: order.userId, courseId: order.itemId, orderId: order.id }
      });
    }
    else if (order.itemType === 'WEBINAR') {
      await tx.webinarAccess.upsert({
        where: { userId_webinarId: { userId: order.userId, webinarId: order.itemId } },
        update: { orderId: order.id },
        create: { userId: order.userId, webinarId: order.itemId, orderId: order.id }
      });
    }
    else if (order.itemType === 'RETREAT') {
      await tx.retreatApplication.updateMany({
        where: { userId: order.userId, retreatId: order.itemId },
        data: { status: 'PAID', orderId: order.id }
      });

      const retreat = await tx.retreat.findUnique({ where: { id: order.itemId } });
      if (retreat && order.user?.email) {
        const subject = `Payment Confirmed: Seat secured for ${retreat.title}!`;
        const htmlBody = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #16a34a;">Payment Successful! ✅</h2>
            <p>Hi ${order.user.name},</p>
            <p>We have successfully received your payment of <strong>${order.currency === 'USD' ? '$' : '₹'}${order.amount}</strong>.</p>
            <p>Your seat for the <strong>${retreat.title}</strong> retreat is officially confirmed! We will share further details regarding the itinerary and packing list soon.</p>
            <p>See you there,<br/>The SIA Team</p>
          </div>
        `;
        try {
          await sendEmail(order.user.email, subject, htmlBody);
        } catch (emailError) {
          console.error("Email failed to send:", emailError);
        }
      }
    }
    else if (order.itemType === 'SUBSCRIPTION') {
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: order.itemId } });
      if (plan) {
        const isTopUp = plan.name.toLowerCase().includes('webinar');
        const existingSub = await tx.userSubscription.findUnique({ where: { userId: order.userId } });

        if (isTopUp && existingSub) {
          await tx.userSubscription.update({
            where: { userId: order.userId },
            data: {
              remainingCredits: existingSub.remainingCredits + plan.webinarCredits,
              isActive: true,
            }
          });
        } else {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (plan.durationDays > 0 ? plan.durationDays : 365));

          await tx.userSubscription.upsert({
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

    return true; // success
  });

  return result;
};
// -----------------------------------------------------------------------------
// 4. [AUTHENTICATED] Direct Cart Checkout Bypass (For free items / admin grants)
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

// -----------------------------------------------------------------------------
// 5. [PUBLIC] Get currency based on IP (for frontend display alignment)
// -----------------------------------------------------------------------------
export const getCurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const country = getCountryFromIP(req);
    const currency = country === 'IN' ? 'INR' : 'USD';
    res.json({ currency });
  } catch (error) {
    console.error('Currency fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};