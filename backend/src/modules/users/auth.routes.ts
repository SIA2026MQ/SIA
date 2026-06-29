import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../../core/middlewares/auth.middleware';
import { getUserSubscription } from './auth.controller';
// We are removing the import from auth.controller to handle the response safely right here.

const router = Router();

// Endpoint: GET /api/auth/me 
// The frontend calls this on page load. If they have a valid Firebase token, 
// it returns their DB profile and role.
router.get('/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  // If the authenticateJWT middleware succeeds, req.user is guaranteed to exist.
  if (req.user) {
    // 🚨 THIS IS THE FIX: We explicitly wrap the response in the "user" key
    res.status(200).json({ user: req.user });
  } else {
    res.status(404).json({ error: "User not found in database" });
  }
});

router.get('/subscription', authenticateJWT, getUserSubscription);

export default router;