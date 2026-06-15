import { Router } from 'express';
import { submitGroupRequest, validateCoupon } from './coupon.controller';
import { getAdminGroupRequests, approveGroupRequest, deleteCoupon } from './coupon.controller';
import express from 'express';
import { 
  createOrder, 
  verifyPayment, 
  razorpayWebhook, 
  checkoutCartBypass 
} from './payment.controller';
import { authenticateJWT,requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/payments/create-order
router.post('/create-order', authenticateJWT, createOrder);

// Endpoint: POST /api/payments/verify
router.post('/verify', authenticateJWT, verifyPayment);

// Endpoint: POST /api/payments/checkout-cart
router.post('/checkout-cart', authenticateJWT, checkoutCartBypass);

// Endpoint: POST /api/payments/webhook (Bypasses JSON parsing in app.ts)
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);
router.post('/group-request', authenticateJWT, submitGroupRequest);
router.post('/validate-coupon', authenticateJWT, validateCoupon);

// ADMIN COUPON ROUTES
router.get('/admin/group-requests', authenticateJWT, requireAdmin, getAdminGroupRequests);
router.post('/admin/group-requests/:requestId/approve', authenticateJWT, requireAdmin, approveGroupRequest);
router.delete('/admin/coupons/:id', authenticateJWT, requireAdmin, deleteCoupon);

export default router;