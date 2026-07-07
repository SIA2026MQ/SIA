import { Router } from 'express';
import { getPendingMigrations, verifyAndGrantAccess } from './migration.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// 🚨 Securely enforce strict admin privileges on both routes
router.get('/pending', authenticateJWT, requireAdmin, getPendingMigrations);
router.post('/grant', authenticateJWT, requireAdmin, verifyAndGrantAccess);

export default router;