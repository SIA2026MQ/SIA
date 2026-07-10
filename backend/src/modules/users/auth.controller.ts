import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [AUTHENTICATED] Get Current User Profile
// -----------------------------------------------------------------------------
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile fetched successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// Get User Subscription
// -----------------------------------------------------------------------------
// Check if user has an active subscription
export const getUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Find any active subscription for this user
    const subscription = await prisma.userSubscription.findFirst({
      where: { 
        userId,
        isActive: true,
        expiryDate: { gt: new Date() } // Ensure it hasn't expired
      },
      include: { plan: true }
    });

    res.status(200).json({ subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
};

// -----------------------------------------------------------------------------
// 🚨 NEW: Get Unread Notifications (Navbar Indicator)
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Get Unread Notifications (Navbar Indicator)
// -----------------------------------------------------------------------------
export const getEventNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) { 
      res.status(404).json({ error: "User not found" }); 
      return; 
    }

    // Find the single newest event for each category
    const latestWebinar = await prisma.webinar.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    const latestRetreat = await prisma.retreat.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    
    // 🚨 UPDATED: Check BOTH DailySession and SatsangSchedule for Live Events
    const latestDailySession = await prisma.dailySession.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    const latestSatsangSchedule = await prisma.satsangSchedule.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });

    let newestSatsangDate = new Date(0);
    if (latestDailySession && latestDailySession.createdAt > newestSatsangDate) newestSatsangDate = latestDailySession.createdAt;
    if (latestSatsangSchedule && latestSatsangSchedule.createdAt > newestSatsangDate) newestSatsangDate = latestSatsangSchedule.createdAt;

    // Compare with user's last viewed timestamps
    const hasNewWebinars = latestWebinar ? latestWebinar.createdAt > user.lastViewedWebinarsAt : false;
    const hasNewRetreats = latestRetreat ? latestRetreat.createdAt > user.lastViewedRetreatsAt : false;
    const hasNewSatsangs = newestSatsangDate.getTime() > 0 ? newestSatsangDate > user.lastViewedSatsangsAt : false;

    res.status(200).json({ hasNewWebinars, hasNewRetreats, hasNewSatsangs });
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// -----------------------------------------------------------------------------
// 🚨 NEW: Mark Event Category as Read
// -----------------------------------------------------------------------------
export const markEventCategoryAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    const updateData: any = {};
    
    if (category === 'webinars') updateData.lastViewedWebinarsAt = new Date();
    else if (category === 'retreats') updateData.lastViewedRetreatsAt = new Date();
    else if (category === 'satsangs') updateData.lastViewedSatsangsAt = new Date();
    else { 
      res.status(400).json({ error: "Invalid category" }); 
      return; 
    }

    await prisma.user.update({
      where: { id: req.user?.id },
      data: updateData
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Update Notifications Error:', err);
    res.status(500).json({ error: "Failed to update notification status" });
  }
};