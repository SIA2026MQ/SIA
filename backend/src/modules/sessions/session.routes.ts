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
  toggleSessionStatus,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule // 🚨 Ensure this is imported!
} from './session.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/today', getTodaySession);
router.get('/plans', getAllPlans);
router.get('/schedules', getSchedules);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.post('/plans', authenticateJWT, requireAdmin, createPlan);
router.put('/plans/:id', authenticateJWT, requireAdmin, updatePlan);
router.delete('/plans/:id', authenticateJWT, requireAdmin, deletePlan);

router.post('/schedules', authenticateJWT, requireAdmin, createSchedule);
router.put('/schedules/:id', authenticateJWT, requireAdmin, updateSchedule);
router.delete('/schedules/:id', authenticateJWT, requireAdmin, deleteSchedule);

router.post('/today', authenticateJWT, requireAdmin, createDailySession);
router.get('/history', authenticateJWT, requireAdmin, getSessionHistory);

// 🚨 Toggle Switch Route
router.patch('/:id/toggle', authenticateJWT, requireAdmin, toggleSessionStatus);

router.put('/:id', authenticateJWT, requireAdmin, updateDailySession);
router.delete('/:id', authenticateJWT, requireAdmin, deleteDailySession);
router.post('/:id/attend', logSessionAttendance);

export default router;