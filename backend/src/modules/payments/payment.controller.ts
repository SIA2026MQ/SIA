// import { Request, Response } from 'express';
// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import { prisma } from '../../core/services/db.service';
// import { AuthRequest } from '../../core/middlewares/auth.middleware';
// import { sendEmail } from '../../core/services/mail.service';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || '',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || '',
// });

// // -----------------------------------------------------------------------------
// // 1. [AUTHENTICATED] Create an order (Handles Multipliers & 100% Free Coupons)
// // -----------------------------------------------------------------------------
// export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user!.id;
//     const { itemId, itemType, customAmountInr, couponId } = req.body;

//     const userCustomAmount = customAmountInr ? Number(customAmountInr) : null;
//     let basePrice = 0;

//     // 1. FETCH BASE PRICE BASED ON ITEM TYPE
//     if (itemType === 'COURSE') {
//       const course = await prisma.course.findUnique({ where: { id: itemId } });
//       if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
//       basePrice = course.priceInr;
//     } 
//     else if (itemType === 'WEBINAR') {
//       const webinar = await prisma.webinar.findUnique({ where: { id: itemId } });
//       if (!webinar) { res.status(404).json({ error: 'Webinar not found' }); return; }
//       basePrice = webinar.minPriceInr;
//     } 
//     else if (itemType === 'SUBSCRIPTION') {
//       const plan = await prisma.subscriptionPlan.findUnique({ where: { id: itemId } });
//       if (!plan) { res.status(404).json({ error: 'Subscription Plan not found' }); return; }
//       basePrice = plan.minPriceInr;
//     } 
//     else if (itemType === 'RETREAT') {
//       const retreat = await prisma.retreat.findUnique({ where: { id: itemId } });
//       if (!retreat) { res.status(404).json({ error: 'Retreat not found' }); return; }
//       basePrice = retreat.priceInr;
//     } 
//     else {
//       res.status(400).json({ error: 'Invalid item type' }); return;
//     }

//     // 2. SECURITY CHECK: Apply Multiplier
//     let finalPriceInr = basePrice;
    
//     if (userCustomAmount !== null) {
//       if (userCustomAmount < basePrice) {
//         res.status(400).json({ error: 'Security Error: Amount is below the minimum required price.' }); 
//         return;
//       }
//       finalPriceInr = userCustomAmount;
//     }

//     // 3. APPLY COUPON DISCOUNT
//     if (couponId) {
//       const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      
//       if (!coupon || !coupon.isActive) {
//         res.status(400).json({ error: 'Invalid or inactive coupon.' }); return;
//       }
//       if (coupon.usedCount >= coupon.maxUses) {
//         res.status(400).json({ error: 'Coupon usage limit reached.' }); return;
//       }
//       if (coupon.expiryDate && coupon.expiryDate < new Date()) {
//         res.status(400).json({ error: 'Coupon has expired.' }); return;
//       }

//       const discountAmount = (finalPriceInr * coupon.discountPercent) / 100;
//       finalPriceInr = Math.max(0, finalPriceInr - discountAmount); 
//     }

//     // 🚨 NEW: 100% FREE TRANSACTION BYPASS (Skips Razorpay entirely)
//     if (finalPriceInr === 0) {
//       const dummyId = `free_${userId.substring(0, 5)}_${Date.now()}`;
      
//       const freeOrder = await prisma.order.create({
//         data: {
//           userId,
//           razorpayOrderId: dummyId,
//           amount: 0,
//           currency: 'INR',
//           itemType,
//           itemId,
//           couponId: couponId || null,
//           status: 'PENDING', 
//         },
//       });

//       // Grant access immediately
//       await handleSuccessfulPayment(freeOrder.id, dummyId);

//       // Return special flag to frontend
//       res.status(200).json({
//         message: '100% Free access granted',
//         freeTransaction: true, // Tell React not to open Razorpay
//         dbOrderId: freeOrder.id,
//       });
//       return; 
//     }

//     // 4. NORMAL RAZORPAY FLOW (For amounts > ₹0)
//     const options = {
//       amount: Math.round(finalPriceInr * 100), // paise
//       currency: 'INR',
//       receipt: `rcpt_${userId.substring(0, 5)}_${Date.now()}`,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     const newOrder = await prisma.order.create({
//       data: {
//         userId,
//         razorpayOrderId: razorpayOrder.id,
//         amount: finalPriceInr,
//         currency: 'INR',
//         itemType,
//         itemId,
//         couponId: couponId || null, 
//         status: 'PENDING',
//       },
//     });

//     res.status(200).json({
//       message: 'Order created successfully',
//       razorpayOrderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       dbOrderId: newOrder.id,
//       freeTransaction: false
//     });
//   } catch (error) {
//     console.error('Create Order Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // -----------------------------------------------------------------------------
// // 2. [AUTHENTICATED] Verify Payment & Grant Access (Browser Callback)
// // -----------------------------------------------------------------------------
// export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;
//     const userId = req.user!.id;

//     // 1. Verify Cryptographic Signature
//     const secret = process.env.RAZORPAY_KEY_SECRET || '';
//     const expectedSignature = crypto
//       .createHmac('sha256', secret)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       await prisma.order.update({ where: { id: dbOrderId }, data: { status: 'FAILED' } });
//       res.status(400).json({ error: 'Invalid signature' }); return;
//     }

//     // 2. Verify Order Ownership
//     const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
//     if (!order || order.userId !== userId || order.razorpayOrderId !== razorpay_order_id) {
//       res.status(403).json({ error: 'Invalid order parameters. Security mismatch.' }); return;
//     }

//     if (order.status === 'SUCCESS') {
//       res.status(200).json({ message: 'Payment already verified.', success: true }); return;
//     }

//     // 3. Process the Success Logic
//     await handleSuccessfulPayment(order.id, razorpay_payment_id);

//     res.status(200).json({ message: 'Payment verified! Access granted.', success: true });
//   } catch (error) {
//     console.error('Verify Payment Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // -----------------------------------------------------------------------------
// // 3. [PUBLIC] Razorpay Server-to-Server Webhook
// // -----------------------------------------------------------------------------
// export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
//     const signature = req.headers['x-razorpay-signature'] as string;

//     const isValid = Razorpay.validateWebhookSignature(
//       JSON.stringify(req.body),
//       signature,
//       webhookSecret
//     );

//     if (!isValid) {
//       res.status(400).json({ error: 'Invalid Webhook Signature' }); return;
//     }

//     if (req.body.event === 'payment.captured') {
//       const paymentData = req.body.payload.payment.entity;
//       const razorpayOrderId = paymentData.order_id;

//       const order = await prisma.order.findUnique({ where: { razorpayOrderId } });

//       if (order && order.status === 'PENDING') {
//         await handleSuccessfulPayment(order.id, paymentData.id);
//       }
//     }

//     res.status(200).json({ status: 'ok' });
//   } catch (error) {
//     console.error('Webhook Error:', error);
//     res.status(500).json({ error: 'Webhook processing failed' });
//   }
// };

// // -----------------------------------------------------------------------------
// // UTILITY: Shared Logic to Grant Access (Idempotent)
// // -----------------------------------------------------------------------------
// const handleSuccessfulPayment = async (dbOrderId: string, razorpayPaymentId: string) => {
//   // 1. Mark Order as Success
//   const order = await prisma.order.update({
//     where: { id: dbOrderId },
//     data: { status: 'SUCCESS', razorpayPaymentId },
//     include: { user: true }
//   });

//   // 🚨 2. INCREMENT COUPON USAGE (If a coupon was used)
//   if (order.couponId) {
//     await prisma.coupon.update({
//       where: { id: order.couponId },
//       data: { usedCount: { increment: 1 } }
//     });
//   }

//   // 3. Grant Access based on Item Type
//   if (order.itemType === 'COURSE') {
//     await prisma.courseAccess.upsert({
//       where: { userId_courseId: { userId: order.userId, courseId: order.itemId } },
//       update: { orderId: order.id },
//       create: { userId: order.userId, courseId: order.itemId, orderId: order.id },
//     });
//   }
//   else if (order.itemType === 'WEBINAR') {
//     await prisma.webinarAccess.upsert({
//       where: { userId_webinarId: { userId: order.userId, webinarId: order.itemId } },
//       update: { orderId: order.id },
//       create: { userId: order.userId, webinarId: order.itemId, orderId: order.id },
//     });
//   }
//   else if (order.itemType === 'RETREAT') {
//     await prisma.retreatApplication.updateMany({
//       where: { userId: order.userId, retreatId: order.itemId },
//       data: { status: 'PAID', orderId: order.id }
//     });

//     const retreat = await prisma.retreat.findUnique({ where: { id: order.itemId } });

//     if (retreat && order.user?.email) {
//       const subject = `Payment Confirmed: Seat secured for ${retreat.title}!`;
//       const htmlBody = `
//         <div style="font-family: sans-serif; padding: 20px;">
//           <h2 style="color: #16a34a;">Payment Successful! ✅</h2>
//           <p>Hi ${order.user.name},</p>
//           <p>We have successfully received your payment of <strong>₹${order.amount}</strong>.</p>
//           <p>Your seat for the <strong>${retreat.title}</strong> retreat is officially confirmed! We will share further details regarding the itinerary and packing list soon.</p>
//           <p>See you there,<br/>The SIA Team</p>
//         </div>
//       `;
//       try {
//         await sendEmail(order.user.email, subject, htmlBody);
//       } catch (emailError) {
//         console.error("Email failed to send:", emailError);
//       }
//     }
//   }
//   else if (order.itemType === 'SUBSCRIPTION') {
//     const plan = await prisma.subscriptionPlan.findUnique({ where: { id: order.itemId } });
//     if (plan) {
//       const isTopUp = plan.name.toLowerCase().includes('webinar');
//       const existingSub = await prisma.userSubscription.findUnique({ where: { userId: order.userId } });

//       if (isTopUp && existingSub) {
//         await prisma.userSubscription.update({
//           where: { userId: order.userId },
//           data: {
//             remainingCredits: existingSub.remainingCredits + plan.webinarCredits,
//             isActive: true,
//           }
//         });
//       } else {
//         const expiryDate = new Date();
//         expiryDate.setDate(expiryDate.getDate() + (plan.durationDays > 0 ? plan.durationDays : 365));

//         await prisma.userSubscription.upsert({
//           where: { userId: order.userId },
//           update: {
//             planId: isTopUp ? existingSub?.planId || plan.id : plan.id,
//             orderId: order.id,
//             remainingCredits: existingSub ? existingSub.remainingCredits + plan.webinarCredits : plan.webinarCredits,
//             expiryDate: isTopUp ? existingSub?.expiryDate || expiryDate : expiryDate,
//             isActive: true,
//           },
//           create: {
//             userId: order.userId,
//             planId: plan.id,
//             orderId: order.id,
//             remainingCredits: plan.webinarCredits,
//             expiryDate: expiryDate,
//             isActive: true,
//           },
//         });
//       }
//     }
//   }
// };

// // -----------------------------------------------------------------------------
// // 4. [AUTHENTICATED] Direct Cart Checkout Bypass (For free items / admin grants)
// // -----------------------------------------------------------------------------
// export const checkoutCartBypass = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user!.id;
//     const { items } = req.body;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       res.status(400).json({ error: 'Cart is empty' });
//       return;
//     }

//     for (const item of items) {
//       const dummyOrderId = `bypass_${userId.substring(0, 5)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

//       await prisma.courseAccess.upsert({
//         where: { userId_courseId: { userId, courseId: item.id } },
//         update: {},
//         create: {
//           userId,
//           courseId: item.id,
//           orderId: dummyOrderId
//         },
//       });
//     }

//     res.status(200).json({ message: 'Cart checkout successful! Access granted.', success: true });
//   } catch (error) {
//     console.error('Cart Checkout Error:', error);
//     res.status(500).json({ error: 'Internal server error during cart checkout' });
//   }
// };

// // -----------------------------------------------------------------------------
// // 🚨 5. [PUBLIC] Validate Coupon Code (NEW ADDITION)
// // -----------------------------------------------------------------------------
// export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { code } = req.body;

//     if (!code) {
//       res.status(400).json({ error: 'Coupon code is required.' });
//       return;
//     }

//     // 1. Look up the coupon (Convert to uppercase just in case they typed it in lowercase)
//     const coupon = await prisma.coupon.findUnique({
//       where: { code: code.toUpperCase() }
//     });

//     // 2. Check if it exists
//     if (!coupon) {
//       res.status(404).json({ error: 'Invalid coupon code.' });
//       return;
//     }

//     // 3. Check if it is manually disabled
//     if (!coupon.isActive) {
//       res.status(400).json({ error: 'This coupon is no longer active.' });
//       return;
//     }

//     // 4. Check if usage limit is reached
//     if (coupon.usedCount >= coupon.maxUses) {
//       res.status(400).json({ error: 'This coupon has reached its maximum usage limit.' });
//       return;
//     }

//     // 5. Check if it is expired
//     if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
//       res.status(400).json({ error: 'This coupon has expired.' });
//       return;
//     }

//     // 6. Success! Send the discount details back to the frontend cart
//     res.status(200).json({
//       id: coupon.id,
//       code: coupon.code,
//       discountPercent: coupon.discountPercent
//     });

//   } catch (error) {
//     console.error('🔥 Validate Coupon Error:', error);
//     res.status(500).json({ error: 'Internal server error validating coupon.' });
//   }
// };

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
// 1. [AUTHENTICATED] Create an order (Handles Multipliers & Coupons)
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 1. [AUTHENTICATED] Create an order (Handles Multipliers & 100% Free Coupons)
// -----------------------------------------------------------------------------
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId, itemType, customAmountInr, couponId } = req.body;

    const userCustomAmount = customAmountInr ? Number(customAmountInr) : null;
    let basePrice = 0;

    // 1. FETCH BASE PRICE BASED ON ITEM TYPE
    if (itemType === 'COURSE') {
      const course = await prisma.course.findUnique({ where: { id: itemId } });
      if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
      basePrice = course.priceInr;
    } 
    else if (itemType === 'WEBINAR') {
      const webinar = await prisma.webinar.findUnique({ where: { id: itemId } });
      if (!webinar) { res.status(404).json({ error: 'Webinar not found' }); return; }
      basePrice = webinar.minPriceInr;
    } 
    else if (itemType === 'SUBSCRIPTION') {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: itemId } });
      if (!plan) { res.status(404).json({ error: 'Subscription Plan not found' }); return; }
      basePrice = plan.minPriceInr;
    } 
    else if (itemType === 'RETREAT') {
      const retreat = await prisma.retreat.findUnique({ where: { id: itemId } });
      if (!retreat) { res.status(404).json({ error: 'Retreat not found' }); return; }
      basePrice = retreat.priceInr;
    } 
    else {
      res.status(400).json({ error: 'Invalid item type' }); return;
    }

    // 2. SECURITY CHECK: Apply Multiplier
    let finalPriceInr = basePrice;
    
    if (userCustomAmount !== null) {
      if (userCustomAmount < basePrice) {
        res.status(400).json({ error: 'Security Error: Amount is below the minimum required price.' }); 
        return;
      }
      finalPriceInr = userCustomAmount;
    }

    // 3. APPLY COUPON DISCOUNT
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

      const discountAmount = (finalPriceInr * coupon.discountPercent) / 100;
      finalPriceInr = Math.max(0, finalPriceInr - discountAmount); 
    }

    // 🚨 NEW: 100% FREE TRANSACTION BYPASS (Skips Razorpay entirely)
    if (finalPriceInr === 0) {
      const dummyId = `free_${userId.substring(0, 5)}_${Date.now()}`;
      
      const freeOrder = await prisma.order.create({
        data: {
          userId,
          razorpayOrderId: dummyId,
          amount: 0,
          currency: 'INR',
          itemType,
          itemId,
          couponId: couponId || null,
          status: 'PENDING', 
        },
      });

      // Grant access immediately
      await handleSuccessfulPayment(freeOrder.id, dummyId);

      // Return special flag to frontend
      res.status(200).json({
        message: '100% Free access granted',
        freeTransaction: true, // Tell React not to open Razorpay
        dbOrderId: freeOrder.id,
      });
      return; 
    }

    // 4. NORMAL RAZORPAY FLOW (For amounts > ₹0)
    const options = {
      amount: Math.round(finalPriceInr * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${userId.substring(0, 5)}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = await prisma.order.create({
      data: {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: finalPriceInr,
        currency: 'INR',
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

    // 1. Verify Cryptographic Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await prisma.order.update({ where: { id: dbOrderId }, data: { status: 'FAILED' } });
      res.status(400).json({ error: 'Invalid signature' }); return;
    }

    // 2. Verify Order Ownership
    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order || order.userId !== userId || order.razorpayOrderId !== razorpay_order_id) {
      res.status(403).json({ error: 'Invalid order parameters. Security mismatch.' }); return;
    }

    if (order.status === 'SUCCESS') {
      res.status(200).json({ message: 'Payment already verified.', success: true }); return;
    }

    // 3. Process the Success Logic
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
  // 1. Mark Order as Success
  const order = await prisma.order.update({
    where: { id: dbOrderId },
    data: { status: 'SUCCESS', razorpayPaymentId },
    include: { user: true }
  });

  // 🚨 2. INCREMENT COUPON USAGE (If a coupon was used)
  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { increment: 1 } }
    });
  }

  // 3. Grant Access based on Item Type
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
    await prisma.retreatApplication.updateMany({
      where: { userId: order.userId, retreatId: order.itemId },
      data: { status: 'PAID', orderId: order.id }
    });

    const retreat = await prisma.retreat.findUnique({ where: { id: order.itemId } });

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
      } catch (emailError) {
        console.error("Email failed to send:", emailError);
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