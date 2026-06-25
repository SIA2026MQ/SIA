import { Router } from 'express';
import { 
  createPlan, 
  getAllPlans, 
  createDailySession, 
  updateDailySession,
  deleteDailySession,
  getTodaySession, 
  getSessionHistory,
  updatePlan,    
  deletePlan,
  logSessionAttendance,
  toggleSessionStatus // 🚨 NEW
} from './session.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/today', getTodaySession);
router.get('/plans', getAllPlans);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.post('/plans', authenticateJWT, requireAdmin, createPlan);
router.put('/plans/:id', authenticateJWT, requireAdmin, updatePlan);
router.delete('/plans/:id', authenticateJWT, requireAdmin, deletePlan);

router.post('/today', authenticateJWT, requireAdmin, createDailySession);
router.get('/history', authenticateJWT, requireAdmin, getSessionHistory);

// 🚨 NEW: Toggle Switch Route
router.patch('/:id/toggle', authenticateJWT, requireAdmin, toggleSessionStatus);

router.put('/:id', authenticateJWT, requireAdmin, updateDailySession);
router.delete('/:id', authenticateJWT, requireAdmin, deleteDailySession);
router.post('/:id/attend', logSessionAttendance);

export default router;