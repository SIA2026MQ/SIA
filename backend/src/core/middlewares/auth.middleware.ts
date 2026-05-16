import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../services/firebase.service';
import { prisma } from '../services/db.service';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export interface AuthRequest extends Request {
  user?: any;
}

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
      res.status(400).json({ error: 'Token missing email' });
      return;
    }

    // Determine role based on admin email
    const role = email === ADMIN_EMAIL ? 'ADMIN' : 'USER';

    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    if (!user) {
      // Try to find by email (legacy or previous signup without uid)
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        // Merge: update existing user with firebaseUid and ensure correct role
        user = await prisma.user.update({
          where: { email },
          data: { firebaseUid: uid, role },
        });
        console.log(`[AUTH] Legacy user merged: ${email}`);
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            firebaseUid: uid,
            email,
            name: name || 'Seeker',
            role,
          },
        });
        console.log(`[AUTH] New user created: ${email} as ${role}`);
      }
    } else if (user.role !== role) {
      // Upgrade to admin if email matches
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
      console.log(`[AUTH] User role updated to ${role}: ${email}`);
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Firebase Auth Error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};