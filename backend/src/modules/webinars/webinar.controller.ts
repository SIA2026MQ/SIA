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
    const scheduledFor = new Date(`${date}T${time}:00`);

    const webinar = await prisma.webinar.create({
      data: {
        title, 
        description, 
        scheduledFor, 
        zoomLink: meetLink, 
        minPriceInr: priceInr, 
        minPriceUsd: 0, 
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
      where: { scheduledFor: { gte: today } }, 
      orderBy: { scheduledFor: 'asc' },
    });

    const authHeader = req.headers.authorization;
    let userId: string | null = null;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        // 🚨 FIX 1: Look up by 'uid' instead of 'email' to guarantee a match
        if (decodedToken.uid) {
          const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
          if (user) {
            userId = user.id;
            isAdmin = user.role === 'ADMIN';
          }
        }
      } catch (err) {
        console.error("Token verification failed silently", err);
      }
    }

    const processedWebinars = await Promise.all(webinars.map(async (webinar) => {
      let hasAccess = isAdmin;

      if (userId && !isAdmin) {
        const access = await prisma.webinarAccess.findUnique({
          where: { userId_webinarId: { userId, webinarId: webinar.id } }
        });
        if (access) hasAccess = true;
      }

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
export const redeemWebinarCredit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id; 
    const { webinarId } = req.body;

    if (!webinarId) {
      res.status(400).json({ error: "Webinar ID is required." });
      return;
    }

    // 🚨 FIX 2: Fetch the webinar so we can send the link back after purchase
    const webinarToRedeem = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinarToRedeem) {
      res.status(404).json({ error: "Webinar not found." });
      return;
    }

    const existingAccess = await prisma.webinarAccess.findUnique({
      where: { userId_webinarId: { userId, webinarId } }
    });

    if (existingAccess) {
      res.status(400).json({ error: "You already have access to this webinar." });
      return;
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription || !subscription.isActive || subscription.remainingCredits < 1) {
      res.status(403).json({ error: "You do not have any available webinar credits." });
      return;
    }

    await prisma.$transaction([
      prisma.userSubscription.update({
        where: { userId },
        data: { remainingCredits: subscription.remainingCredits - 1 }
      }),
      prisma.webinarAccess.create({
        data: { userId, webinarId }
      })
    ]);

    // 🚨 FIX 3: Return the actual link!
    res.status(200).json({ 
      message: "Webinar redeemed successfully!",
      meetLink: webinarToRedeem.zoomLink 
    });

  } catch (error: any) {
    console.error('Redeem Webinar Error:', error);
    res.status(500).json({ error: 'Failed to redeem webinar credit.' });
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
        scheduledFor, 
        zoomLink: meetLink, 
        minPriceInr: priceInr, 
        minPriceUsd: 0,
        ...(imageUrl && { imageUrl }), 
      },
    });

    res.status(200).json({ message: 'Webinar updated', webinar });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update webinar' });
  }
};