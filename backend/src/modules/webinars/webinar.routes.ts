import { Router } from 'express';
import { 
  getWebinars, 
  createWebinar, 
  updateWebinar, 
  deleteWebinar ,
  redeemWebinarCredit,
  logWebinarAttendance,
} from './webinar.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Public Route (Users need to see the webinars too!)
router.get('/', getWebinars);

// Admin Routes (Protected)
router.post('/', authenticateJWT, requireAdmin, createWebinar);
router.put('/:id', authenticateJWT, requireAdmin, updateWebinar);
router.delete('/:id', authenticateJWT, requireAdmin, deleteWebinar);
router.post('/redeem', authenticateJWT, redeemWebinarCredit);
router.post('/:webinarId/attend', authenticateJWT, logWebinarAttendance);
export default router;