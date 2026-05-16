import { Router } from 'express';
import { createOrder, verifyPayment, razorpayWebhook } from './payment.controller';
import { authenticateJWT } from '../../core/middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/payments/create-order
router.post('/create-order', authenticateJWT, createOrder);

// Endpoint: POST /api/payments/verify
router.post('/verify', authenticateJWT, verifyPayment);

// Endpoint: POST /api/payments/webhook
// NOTE: This must remain PUBLIC because Razorpay's servers trigger this, not a logged-in user.
router.post('/webhook', razorpayWebhook);

export default router;