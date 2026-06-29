
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// [AUTHENTICATED] Get Current User Profile
// -----------------------------------------------------------------------------
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // The authenticateJWT middleware already verified the Google token 
    // and attached the Prisma user to req.user!
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

// Import prisma and firebaseAdmin at the top if they aren't already there!
// import { prisma } from '../../core/services/db.service';
// import { firebaseAdmin } from '../../core/services/firebase.service';

// -----------------------------------------------------------------------------
// Get User Subscription
// -----------------------------------------------------------------------------
export const getUserSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Verify Firebase Token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    
    // 2. Find user in Postgres
    const user = await prisma.user.findUnique({ 
      where: { firebaseUid: decodedToken.uid } 
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 3. Find active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiryDate: { gte: new Date() } 
      },
      include: { plan: true }
    });

    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Fetch Subscription Error:', error);
    res.status(500).json({ error: 'Internal server error while fetching subscription' });
  }
};