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
    const { title, zoomLink, time, sessionType, isActive } = req.body;
    
    // If Admin enabled this link, turn OFF all other links automatically
    if (isActive) {
      await prisma.dailySession.updateMany({ data: { isActive: false } });
    }

    const session = await prisma.dailySession.create({
      data: {
        title: title || 'Live Session',
        zoomLink,
        time, 
        sessionType: sessionType || 'Satsung',
        isActive: isActive || false
      },
    });
    res.status(201).json({ message: 'Master link created', session });
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
    const { title, zoomLink, time, sessionType, isActive } = req.body;

    if (isActive) {
      await prisma.dailySession.updateMany({
        where: { id: { not: id } },
        data: { isActive: false }
      });
    }

    const session = await prisma.dailySession.update({
      where: { id },
      data: { title, zoomLink, time, sessionType, isActive },
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
// -----------------------------------------------------------------------------
// [ADMIN] Delete Daily Session
// -----------------------------------------------------------------------------
export const deleteDailySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Cascade delete handles attendances automatically now!
    await prisma.dailySession.delete({ where: { id } });
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
      orderBy: { createdAt: 'desc' }, // Sorted by creation instead of the removed 'date'
      take: 30, 
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
    // ONLY fetch the link where the Admin selected "Enable"
    const session = await prisma.dailySession.findFirst({
      where: { isActive: true }
    });

    if (!session) {
      res.status(404).json({ message: 'No live session active currently.' });
      return;
    }

    let hasActiveSubscription = false;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        if (decodedToken.uid) {
          const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
          if (user) {
            if (user.role === 'ADMIN') hasActiveSubscription = true;
            else {
              const activeSub = await prisma.userSubscription.findFirst({
                where: { userId: user.id, isActive: true, expiryDate: { gte: new Date() } },
              });
              if (activeSub) hasActiveSubscription = true;
            }
          }
        }
      } catch (err) {}
    }

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
// -----------------------------------------------------------------------------
export const toggleSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive) {
      await prisma.dailySession.updateMany({ data: { isActive: false } });
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

// -----------------------------------------------------------------------------
// [PUBLIC/STUDENT] Get Upcoming Schedules
// -----------------------------------------------------------------------------
export const getSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only fetch schedules from today onwards (hides past events)
    const schedules = await prisma.satsangSchedule.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { date: 'asc' }
    });
    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Schedule CRUD
// -----------------------------------------------------------------------------
export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, time, category } = req.body;
    const schedule = await prisma.satsangSchedule.create({
      data: { title, date: new Date(date), time, category }
    });
    res.status(201).json({ schedule });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, date, time, category } = req.body;
    const schedule = await prisma.satsangSchedule.update({
      where: { id },
      data: { title, date: new Date(date), time, category }
    });
    res.status(200).json({ schedule });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.satsangSchedule.delete({ where: { id } });
    res.status(200).json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};