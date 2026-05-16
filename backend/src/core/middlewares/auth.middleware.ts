import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../services/firebase.service';
import { prisma } from '../services/db.service';

export interface AuthRequest extends Request {
  user?: any;
}

// -----------------------------------------------------------------------------
// 1. Authenticate Firebase JWT & Sync to PostgreSQL
// -----------------------------------------------------------------------------
export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    if (!email) {
      res.status(400).json({ error: 'Token missing email payload' }); return;
    }

    // 1. Look for the user using their true OAuth2 ID
    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    // 2. The Handshake Logic
    if (!user) {
      // Check if they are a legacy user (they have an account, but no Google ID yet)
      const legacyUser = await prisma.user.findUnique({ where: { email } });

      if (legacyUser) {
        // MERGE ACCOUNT: Attach the new Google ID to the old database row
        user = await prisma.user.update({
          where: { email },
          data: { firebaseUid: uid }
        });
        console.log(`[AUTH] Legacy user merged with Google OAuth: ${email}`);
      } else {
        // NEW USER: Create them from scratch
        user = await prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email,
            name: name || 'Sincere Seeker',
          },
        });
        console.log(`[AUTH] New user provisioned: ${email}`);
      }
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Firebase Auth Error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// -----------------------------------------------------------------------------
// 2. Check for Admin Role (Fixes the Server Crash)
// -----------------------------------------------------------------------------
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // We check if the user object exists on the request and if their role is ADMIN
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Let them pass to the route controller
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};