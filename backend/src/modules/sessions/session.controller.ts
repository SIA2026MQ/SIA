import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [ADMIN] Create a Subscription Plan (e.g., "Monthly Pro")
// -----------------------------------------------------------------------------
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
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
    const { title, zoomLink, date } = req.body;
    
    const session = await prisma.dailySession.create({
      data: {
        title: title || 'Daily Live Session',
        zoomLink,
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
// [ADMIN] Get Session History (For Admin Dashboard)
// -----------------------------------------------------------------------------
export const getSessionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await prisma.dailySession.findMany({
      orderBy: { date: 'desc' }, 
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
          gte: twentyFourHoursAgo // "Greater Than or Equal to" 24 hours ago
        } 
      },
      orderBy: { date: 'desc' } // Always grab the most recently posted one
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
        
        if (decodedToken.email) {
          const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });
          
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