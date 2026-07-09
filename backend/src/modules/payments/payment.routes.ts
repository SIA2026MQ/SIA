import { Router } from 'express';
import express from 'express';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

// Controllers
import {
  submitGroupRequest,
  validateCoupon,
  getAdminGroupRequests,
  approveGroupRequest,
  deleteCoupon
} from './coupon.controller';

import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  checkoutCartBypass,
  getCurrency    
} from './payment.controller';

// 🚨 NEW: Import the Course Coupon controllers you created
import { createCourseCoupon, getCourseCoupons } from './course-coupon.controller';

const router = Router();

// ============================================================================
// PUBLIC & USER ROUTES
// ============================================================================
// Endpoint: POST /api/payments/create-order
router.post('/create-order', authenticateJWT, createOrder);

// Endpoint: POST /api/payments/verify
router.post('/verify', authenticateJWT, verifyPayment);

// Endpoint: POST /api/payments/checkout-cart
router.post('/checkout-cart', authenticateJWT, checkoutCartBypass);

router.get('/currency', getCurrency);

// Endpoint: POST /api/payments/webhook (Bypasses JSON parsing in app.ts)
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

router.post('/group-request', authenticateJWT, submitGroupRequest);
router.post('/validate-coupon', authenticateJWT, validateCoupon);

// ============================================================================
// ADMIN COUPON ROUTES
// ============================================================================
router.get('/admin/group-requests', authenticateJWT, requireAdmin, getAdminGroupRequests);
router.post('/admin/group-requests/:requestId/approve', authenticateJWT, requireAdmin, approveGroupRequest);

// 🚨 NEW: Course Cart Coupon Routes
router.post('/admin/course-coupons', authenticateJWT, requireAdmin, createCourseCoupon);
router.get('/admin/course-coupons', authenticateJWT, requireAdmin, getCourseCoupons);

// Shared Delete Route
router.delete('/admin/coupons/:id', authenticateJWT, requireAdmin, deleteCoupon);

export default router;