import { Router } from 'express';
import { createPlan, getAllPlans, createDailySession, getTodaySession } from './session.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
// Endpoint: GET /api/sessions/today (Public viewing, link is securely locked)
router.get('/today', getTodaySession);

// Endpoint: GET /api/sessions/plans (Used by frontend to display pricing cards)
router.get('/plans', getAllPlans);


// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
// Endpoint: POST /api/sessions/plans (Create new subscription tiers)
router.post('/plans', authenticateJWT, requireAdmin, createPlan);

// Endpoint: POST /api/sessions (Schedule the daily zoom link)
router.post('/', authenticateJWT, requireAdmin, createDailySession);

export default router;