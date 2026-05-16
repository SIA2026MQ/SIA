import { Response } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

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