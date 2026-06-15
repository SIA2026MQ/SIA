import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Schedule a Webinar
// -----------------------------------------------------------------------------
export const createWebinar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, date, time, meetLink, priceInr, imageUrl } = req.body;

    // Combine 'date' and 'time' from frontend into a single Date object for the DB
    const scheduledFor = new Date(`${date}T${time}:00`);

    const webinar = await prisma.webinar.create({
      data: {
        title, 
        description, 
        scheduledFor,           // Maps to DB schema
        zoomLink: meetLink,     // Maps to DB schema
        minPriceInr: priceInr,  // Maps to DB schema
        minPriceUsd: 0,         // Default to 0 since we removed it from UI
        ...(imageUrl && { imageUrl }), 
      },
    });

    res.status(201).json({ message: 'Webinar created', webinar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC] Get Webinars
// -----------------------------------------------------------------------------
export const getWebinars = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const webinars = await prisma.webinar.findMany({
      where: { scheduledFor: { gte: today } }, // Search using DB schema
      orderBy: { scheduledFor: 'asc' },
    });

    const authHeader = req.headers.authorization;
    let userId: string | null = null;
    let isAdmin = false;

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
      } catch (err) {}
    }

    const processedWebinars = await Promise.all(webinars.map(async (webinar) => {
      let hasAccess = isAdmin;

      if (userId && !isAdmin) {
        const access = await prisma.webinarAccess.findUnique({
          where: { userId_webinarId: { userId, webinarId: webinar.id } }
        });
        if (access) hasAccess = true;
      }

      // Convert DB 'scheduledFor' back to separate 'date' and 'time' for the frontend
      const dateStr = webinar.scheduledFor.toISOString().split('T')[0];
      const timeStr = webinar.scheduledFor.toISOString().split('T')[1].substring(0, 5);

      return {
        ...webinar,
        date: dateStr,
        time: timeStr,
        meetLink: hasAccess ? webinar.zoomLink : 'LOCKED - Purchase or use Credit to get link',
        priceInr: webinar.minPriceInr,
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
// [AUTHENTICATED] Redeem a Subscription Credit
// -----------------------------------------------------------------------------
export const redeemWebinarCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { webinarId } = req.body;
    let unlockedMeetLink = "";

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.findUnique({ where: { userId } });

      if (!subscription || !subscription.isActive || subscription.expiryDate < new Date()) {
        throw new Error('No active subscription found.');
      }
      if (subscription.remainingCredits <= 0) {
        throw new Error('No webinar credits remaining. Please upgrade your plan.');
      }

      const existingAccess = await tx.webinarAccess.findUnique({
        where: { userId_webinarId: { userId, webinarId } },
      });
      if (existingAccess) throw new Error('You already have access to this webinar.');

      const webinar = await tx.webinar.findUnique({ where: { id: webinarId }});
      if (!webinar) throw new Error('Webinar not found.');
      
      unlockedMeetLink = webinar.zoomLink || ""; // Get DB schema zoomLink

      await tx.userSubscription.update({
        where: { userId },
        data: { remainingCredits: { decrement: 1 } },
      });

      await tx.webinarAccess.create({ data: { userId, webinarId } });
    });

    res.status(200).json({ 
      meetLink: unlockedMeetLink,
      message: 'Credit redeemed successfully! The Zoom link is now unlocked.' 
    });
  } catch (error: any) {
    if (error.message.includes('No active') || error.message.includes('No webinar credits') || error.message.includes('already have access')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Credit Redemption Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Delete a Webinar
// -----------------------------------------------------------------------------
export const deleteWebinar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.$transaction([
      prisma.webinarAccess.deleteMany({ where: { webinarId: id } }),
      prisma.order.deleteMany({ where: { itemType: 'WEBINAR', itemId: id } }),
      prisma.webinar.delete({ where: { id: id } })
    ]);

    res.status(200).json({ message: 'Webinar deleted successfully' });
  } catch (error) {
    console.error('Delete Webinar Error:', error);
    res.status(500).json({ error: 'Failed to delete webinar' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Update a Webinar
// -----------------------------------------------------------------------------
export const updateWebinar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, date, time, meetLink, priceInr, imageUrl } = req.body;

    const scheduledFor = new Date(`${date}T${time}:00`);

    const webinar = await prisma.webinar.update({
      where: { id },
      data: {
        title, 
        description, 
        scheduledFor,           // Maps to DB schema
        zoomLink: meetLink,     // Maps to DB schema
        minPriceInr: priceInr,  // Maps to DB schema
        minPriceUsd: 0,
        ...(imageUrl && { imageUrl }), 
      },
    });

    res.status(200).json({ message: 'Webinar updated', webinar });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update webinar' });
  }
};