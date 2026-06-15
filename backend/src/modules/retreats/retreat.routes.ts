import { Router } from 'express';
import { 
  createRetreat, 
  getRetreats, 
  applyForRetreat, 
  getAllApplications, 
  updateApplicationStatus,
  getMyApplications,
  deleteRetreat,
  updateRetreat // 🚨 IMPORT THIS
} from './retreat.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Public / User Routes
router.get('/', getRetreats);
router.post('/apply', authenticateJWT, applyForRetreat);
router.get('/my-applications', authenticateJWT, getMyApplications);

// Admin Routes
router.post('/', authenticateJWT, requireAdmin, createRetreat);
router.get('/applications', authenticateJWT, requireAdmin, getAllApplications);
router.patch('/applications/:applicationId/status', authenticateJWT, requireAdmin, updateApplicationStatus);
router.delete('/:id', authenticateJWT, requireAdmin, deleteRetreat); // 🚨 ADD THIS LINE
router.put('/:id', authenticateJWT, requireAdmin, updateRetreat); // 🚨 ADD THIS LINE

export default router;