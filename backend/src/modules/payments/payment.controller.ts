import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../../core/services/db.service';
import { emailQueue } from '../../core/services/queue.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

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
    
    // Ensure custom amount is treated as a number to prevent injection bugs
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

    // 1. Check Signature Validity
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await prisma.order.update({ where: { id: dbOrderId }, data: { status: 'FAILED' } });
      res.status(400).json({ error: 'Invalid signature' }); return;
    }

    // 2. SECURITY CHECK: Ensure this user actually owns this order and the Razorpay IDs match
    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order || order.userId !== userId || order.razorpayOrderId !== razorpay_order_id) {
      res.status(403).json({ error: 'Invalid order parameters. Security mismatch.' }); return;
    }

    // 3. RACE CONDITION CHECK: If the webhook already processed this, just return success
    if (order.status === 'SUCCESS') {
      res.status(200).json({ message: 'Payment already verified.', success: true }); return;
    }

    // 4. Process the successful payment
    await handleSuccessfulPayment(order.id, razorpay_payment_id);

    res.status(200).json({ message: 'Payment verified! Access granted.', success: true });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// 3. [PUBLIC] Razorpay Server-to-Server Webhook (The Safety Net)
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

      // RACE CONDITION CHECK: Only process if PENDING
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
  });

  // Using UPSERT everywhere to prevent database crashes if run concurrently
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
    await emailQueue.add('webinar-purchase', { userId: order.userId, webinarId: order.itemId });
  } 
  else if (order.itemType === 'SUBSCRIPTION') {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: order.itemId } });
    if (plan) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

      await prisma.userSubscription.upsert({
        where: { userId: order.userId },
        update: {
          planId: plan.id,
          orderId: order.id,
          remainingCredits: plan.webinarCredits, 
          expiryDate: expiryDate,
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
};