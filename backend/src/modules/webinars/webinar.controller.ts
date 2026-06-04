import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Schedule a Webinar with Pricing
// -----------------------------------------------------------------------------
export const createWebinar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, zoomLink, minPriceInr, minPriceUsd, scheduledFor } = req.body;

    const newWebinar = await prisma.webinar.create({
      data: {
        title,
        description,
        zoomLink,
        minPriceInr,
        minPriceUsd,
        scheduledFor: new Date(scheduledFor),
      },
    });

    res.status(201).json({ message: 'Webinar scheduled', webinar: newWebinar });
  } catch (error) {
    console.error('Create Webinar Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC] Get Webinars (Secured by One-Time Purchase OR Credit)
// -----------------------------------------------------------------------------
export const getUpcomingWebinars = async (req: Request, res: Response): Promise<void> => {
  try {
    const webinars = await prisma.webinar.findMany({
      where: { scheduledFor: { gte: new Date() } },
      orderBy: { scheduledFor: 'asc' },
    });

    const authHeader = req.headers.authorization;
    let userId: string | null = null;
    let isAdmin = false;

    // THE FIREBASE SECURITY LOCK
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

        if (decodedToken.email) {
          const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });
          if (user) {
            userId = user.id;
            isAdmin = user.role === 'ADMIN';
          }
        }
      } catch (err) {
        // Ignore expired/invalid tokens, treat as a public guest
      }
    }

    const processedWebinars = await Promise.all(webinars.map(async (webinar) => {
      let hasAccess = isAdmin;

      if (userId && !isAdmin) {
        // Check if the user bought it or redeemed a credit for it
        const access = await prisma.webinarAccess.findUnique({
          where: { userId_webinarId: { userId, webinarId: webinar.id } }
        });
        if (access) hasAccess = true;
      }

      return {
        ...webinar,
        zoomLink: hasAccess ? webinar.zoomLink : 'LOCKED - Purchase or use Credit to get Zoom link',
        hasAccess
      };
    }));

    res.status(200).json({ webinars: processedWebinars });
  } catch (error) {
    console.error('Fetch Webinars Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [AUTHENTICATED] Redeem a Subscription Credit for a Webinar
// -----------------------------------------------------------------------------
export const redeemWebinarCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { webinarId } = req.body;

    // Transaction ensures credits can never be double-spent
    await prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.findUnique({
        where: { userId },
      });

      if (!subscription || !subscription.isActive || subscription.expiryDate < new Date()) {
        throw new Error('No active subscription found.');
      }
      if (subscription.remainingCredits <= 0) {
        throw new Error('No webinar credits remaining. Please purchase a la carte.');
      }

      const existingAccess = await tx.webinarAccess.findUnique({
        where: { userId_webinarId: { userId, webinarId } },
      });

      if (existingAccess) {
        throw new Error('You already have access to this webinar.');
      }

      // Deduct the credit
      await tx.userSubscription.update({
        where: { userId },
        data: { remainingCredits: { decrement: 1 } },
      });

      // Grant access
      await tx.webinarAccess.create({
        data: { userId, webinarId },
      });
    });

    res.status(200).json({ message: 'Credit redeemed successfully! The Zoom link is now unlocked in your dashboard.' });
  } catch (error: any) {
    if (error.message.includes('No active') || error.message.includes('No webinar credits') || error.message.includes('already have access')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Credit Redemption Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};