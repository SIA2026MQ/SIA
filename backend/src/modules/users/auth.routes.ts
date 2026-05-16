import { Router } from 'express';
import { getMe } from './auth.controller';
import { authenticateJWT } from '../../core/middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/auth/me 
// The frontend calls this on page load. If they have a valid Firebase token, 
// it returns their DB profile and role.
router.get('/me', authenticateJWT, getMe);

export default router;