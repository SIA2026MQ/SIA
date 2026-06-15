import { Router } from 'express';
import { 
  createPlan, 
  getAllPlans, 
  createDailySession, 
  getTodaySession, 
  getSessionHistory 
} from './session.controller';
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

// Endpoint: POST /api/sessions/today (Schedule the daily zoom link)
router.post('/today', authenticateJWT, requireAdmin, createDailySession);

// Endpoint: GET /api/sessions/history (View past sessions in Admin panel)
router.get('/history', authenticateJWT, requireAdmin, getSessionHistory);

export default router;