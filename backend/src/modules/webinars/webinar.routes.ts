import { Router } from 'express';
import { createWebinar, getUpcomingWebinars, redeemWebinarCredit } from './webinar.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/webinars (Public viewing, links are locked based on auth)
router.get('/', getUpcomingWebinars);

// Endpoint: POST /api/webinars (ONLY Admins)
router.post('/', authenticateJWT, requireAdmin, createWebinar);

// Endpoint: POST /api/webinars/redeem (Authenticated users spending a credit)
router.post('/redeem', authenticateJWT, redeemWebinarCredit);

export default router;