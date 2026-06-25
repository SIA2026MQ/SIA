import { Router } from 'express';
// 🚨 1. Make sure toggleUserBlock is imported here!
import { getAdminStats, getAdminUsers, updateUserLevel, toggleUserBlock } from './admin.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Apply authentication and admin check to all routes in this file
router.use(authenticateJWT, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/level', updateUserLevel);

// 🚨 2. THIS IS THE CRITICAL MISSING LINK:
router.put('/users/:id/block', toggleUserBlock); 

export default router;