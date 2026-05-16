import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [ADMIN] Create a Subscription Plan (e.g., "Monthly Pro")
// -----------------------------------------------------------------------------
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    // UPDATED: Now strictly matches your new Prisma Schema (minPrice and webinarCredits)
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
      orderBy: { minPriceInr: 'asc' } // Show cheapest plans first
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
        date: new Date(date), 
      },
    });
    res.status(201).json({ message: 'Daily session scheduled', session });
  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC/STUDENT] Get Today's Session (With Dynamic Firebase Security Lock)
// -----------------------------------------------------------------------------
export const getTodaySession = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Find a session scheduled for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const session = await prisma.dailySession.findFirst({
      where: { date: { gte: todayStart, lte: todayEnd } },
    });

    if (!session) {
      res.status(404).json({ message: 'No live session scheduled for today.' });
      return;
    }

    // 2. THE FIREBASE SECURITY LOCK
    let hasActiveSubscription = false;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        // Verify with Google Firebase instead of JWT
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        if (decodedToken.email) {
          const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });
          
          if (user) {
            if (user.role === 'ADMIN') {
              hasActiveSubscription = true;
            } else {
              // Check if user has an active, unexpired subscription
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
        // Ignore invalid/expired tokens, treat as public guest
      }
    }

    // 3. Strip the Zoom link if they don't have a plan
    if (!hasActiveSubscription) {
      session.zoomLink = 'LOCKED - Active Subscription Required';
    }

    res.status(200).json({ session, hasActiveSubscription });
  } catch (error) {
    console.error('Fetch Session Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};