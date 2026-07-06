import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../../core/middlewares/auth.middleware';

// Adjust this import to match where your controllers live
import { 
  getMe, 
  getUserSubscription, 
  getEventNotifications, 
  markEventCategoryAsRead 
} from './auth.controller'; 

const router = Router();

router.get('/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(404).json({ error: "User not found in database" });
  }
});

router.get('/subscription', authenticateJWT, getUserSubscription);

// 🚨 NEW: Notification Endpoints
router.get('/notifications', authenticateJWT, getEventNotifications);
router.post('/notifications/read', authenticateJWT, markEventCategoryAsRead);

export default router;