import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [PUBLIC] Get All Subscription Plans (For the Frontend Pricing Page)
// -----------------------------------------------------------------------------
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { minPriceInr: 'asc' }
    });
    res.status(200).json({ plans });
  } catch (error) {
    console.error('Fetch Plans Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Post the Daily Zoom Link
// -----------------------------------------------------------------------------
export const createDailySession = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 Extract 'time' from req.body
    const { title, zoomLink, date, time } = req.body;
    
    const session = await prisma.dailySession.create({
      data: {
        title: title || 'Daily Live Session',
        zoomLink,
        time, // 🚨 Save new time field
        date: date ? new Date(date) : new Date(), 
      },
    });
    res.status(201).json({ message: 'Daily session scheduled', session });
  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Update Daily Session
// -----------------------------------------------------------------------------
export const updateDailySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, zoomLink, time } = req.body;

    const session = await prisma.dailySession.update({
      where: { id },
      data: { title, zoomLink, time },
    });

    res.status(200).json({ message: 'Session updated successfully', session });
  } catch (error) {
    console.error('Update Session Error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Delete Daily Session
// -----------------------------------------------------------------------------
export const deleteDailySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.dailySession.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete Session Error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Get Session History (For Admin Dashboard)
// -----------------------------------------------------------------------------
export const getSessionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await prisma.dailySession.findMany({
      orderBy: { date: 'desc' }, 
      take: 30, // Limit to 30 to prevent massive loads
    });
    res.status(200).json({ sessions });
  } catch (error) {
    console.error('Fetch Session History Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC/STUDENT] Get Active Session (Rolling 24-Hour Window)
// -----------------------------------------------------------------------------
export const getTodaySession = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Calculate exactly 24 hours ago from right now
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. Query the most recent session that is LESS THAN 24 hours old
    const session = await prisma.dailySession.findFirst({
      where: { 
        date: { 
          gte: twentyFourHoursAgo 
        } 
      },
      orderBy: { date: 'desc' } 
    });

    if (!session) {
      res.status(404).json({ message: 'No live session active currently.' });
      return;
    }

    // 3. THE FIREBASE SECURITY LOCK
    let hasActiveSubscription = false;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        // 🚨 FIXED: Check by UID for 100% reliability
        if (decodedToken.uid) {
          const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
          
          if (user) {
            if (user.role === 'ADMIN') {
              hasActiveSubscription = true;
            } else {
              const activeSub = await prisma.userSubscription.findFirst({
                where: {
                  userId: user.id,
                  isActive: true,
                  expiryDate: { gte: new Date() },
                },
              });
              if (activeSub) hasActiveSubscription = true;
            }
          }
        }
      } catch (err) {
        // Ignore invalid/expired tokens
      }
    }

    // 4. Strip the Zoom link if they don't have a plan
    if (!hasActiveSubscription) {
      session.zoomLink = 'LOCKED - Active Subscription Required';
    }

    res.status(200).json({ session, hasActiveSubscription });
  } catch (error) {
    console.error('Fetch Session Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Update a Subscription Plan
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// [ADMIN] Update a Subscription Plan
// -----------------------------------------------------------------------------
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // 🚨 Ensure minPriceUsd is extracted and saved here too
    const { name, durationDays, minPriceInr, minPriceUsd, webinarCredits } = req.body;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { name, durationDays, minPriceInr, minPriceUsd, webinarCredits },
    });

    res.status(200).json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update Plan Error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Delete a Subscription Plan
// -----------------------------------------------------------------------------
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Create a Subscription Plan
// -----------------------------------------------------------------------------
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 Ensure minPriceUsd is extracted and saved here
    const { name, durationDays, minPriceInr, minPriceUsd, webinarCredits } = req.body;
    
    const plan = await prisma.subscriptionPlan.create({
      data: { name, durationDays, minPriceInr, minPriceUsd, webinarCredits },
    });
    
    res.status(201).json({ message: 'Subscription Plan created', plan });
  } catch (error) {
    console.error('Create Plan Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [STUDENT] Log Attendance for a Session
// -----------------------------------------------------------------------------
export const logSessionAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    
    // 1. Manually verify the user just like we do in getTodaySession
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 2. Check if they already logged attendance for this specific session
    const existingRecord = await prisma.dailySessionAttendance.findUnique({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: sessionId
        }
      }
    });

    // 3. If no record exists, create one!
    if (!existingRecord) {
      await prisma.dailySessionAttendance.create({
        data: {
          userId: user.id,
          sessionId: sessionId
        }
      });
    }

    res.status(200).json({ success: true, message: "Attendance logged" });
  } catch (error) {
    console.error('Log Attendance Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// 🚨 [ADMIN] TOGGLE SESSION ENABLE/DISABLE (NEW)
// -----------------------------------------------------------------------------
export const toggleSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // If enabling, disable all other sessions first so only ONE link is ever live
    if (isActive) {
      await prisma.dailySession.updateMany({
        data: { isActive: false }
      });
    }

    const session = await prisma.dailySession.update({
      where: { id },
      data: { isActive }
    });

    res.status(200).json({ message: isActive ? 'Link Enabled' : 'Link Disabled', session });
  } catch (error) {
    console.error('Toggle Session Error:', error);
    res.status(500).json({ error: 'Failed to toggle session' });
  }
};