import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { sendEmail } from '../../core/services/mail.service';

// -----------------------------------------------------------------------------
// 1. [ADMIN] Create Retreat
// -----------------------------------------------------------------------------
export const createRetreat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, location, startDate, endDate, priceInr, imageUrl } = req.body;

    const retreat = await prisma.retreat.create({
      data: {
        title, description, location, priceInr,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(imageUrl && { imageUrl }),
      },
    });

    res.status(201).json({ message: 'Retreat created successfully', retreat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create retreat' });
  }
};

// -----------------------------------------------------------------------------
// 2. [ADMIN] Delete Retreat (NEW)
// -----------------------------------------------------------------------------

export const deleteRetreat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 🚨 We use a Prisma Transaction to delete the applications FIRST, then the retreat.
    // If either operation fails, the whole thing rolls back safely.
    await prisma.$transaction([
      prisma.retreatApplication.deleteMany({
        where: { retreatId: id }
      }),
      prisma.retreat.delete({
        where: { id }
      })
    ]);

    res.status(200).json({ message: 'Retreat and all associated applications deleted successfully.' });
  } catch (error: any) {
    console.error('Delete Retreat Error:', error);
    res.status(500).json({ error: 'Failed to delete retreat' });
  }
};

// -----------------------------------------------------------------------------
// 3. [PUBLIC/USER] Get Upcoming Retreats
// -----------------------------------------------------------------------------
export const getRetreats = async (req: Request, res: Response): Promise<void> => {
  try {
    const retreats = await prisma.retreat.findMany({
      where: { startDate: { gt: new Date() } },
      orderBy: { startDate: 'asc' },
      include: { applications: true }
    });
    res.status(200).json({ retreats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retreats' });
  }
};

// -----------------------------------------------------------------------------
// 4. [AUTHENTICATED USER] Apply for a Retreat
// -----------------------------------------------------------------------------
export const applyForRetreat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { retreatId, name, phone } = req.body; 

    // Securely fetch user email from DB, ignoring anything sent from the frontend
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const application = await prisma.retreatApplication.create({
      data: { userId, retreatId, name, email: user.email, phone, status: 'PENDING' },
    });

    res.status(201).json({ message: 'Application submitted for review!', application });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'You have already applied for this retreat.' }); return;
    }
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// -----------------------------------------------------------------------------
// 5. [AUTHENTICATED USER] Get My Applications
// -----------------------------------------------------------------------------
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const applications = await prisma.retreatApplication.findMany({
      where: { userId },
      include: { retreat: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
};

// -----------------------------------------------------------------------------
// 6. [ADMIN] Get All Applications
// -----------------------------------------------------------------------------
export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await prisma.retreatApplication.findMany({
      include: { retreat: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// -----------------------------------------------------------------------------
// 7. [ADMIN] Approve or Disapprove Application (Sends Email to DB User)
// -----------------------------------------------------------------------------
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; 

    const application = await prisma.retreatApplication.update({
      where: { id: applicationId },
      data: { status },
      include: { retreat: true, user: true } // Fetch the DB user
    });

    // Send Email to the DB User's email
    const subject = status === 'APPROVED' 
      ? `You're Approved! Join us for ${application.retreat.title}` 
      : `Update on your application for ${application.retreat.title}`;
      
    const htmlBody = status === 'APPROVED'
      ? `<div style="font-family: sans-serif; padding: 20px;">
           <h2 style="color: #600694;">Application Approved! 🎉</h2>
           <p>Hi ${application.user.name},</p>
           <p>Great news! Your profile has been approved for the <strong>${application.retreat.title}</strong> retreat.</p>
           <p>Please log into your dashboard to complete your payment and secure your spot.</p>
           <p>Thanks,<br/>The SIA Team</p>
         </div>`
      : `<div style="font-family: sans-serif; padding: 20px;">
           <p>Hi ${application.user.name},</p>
           <p>Thank you for applying to <strong>${application.retreat.title}</strong>. Unfortunately, we cannot accommodate your application at this time.</p>
           <p>Best,<br/>The SIA Team</p>
         </div>`;

    try {
      await sendEmail(application.user.email, subject, htmlBody);
    } catch (emailError) {
      console.error("Status updated, but email failed:", emailError);
    }

    res.status(200).json({ message: `Application ${status} updated!`, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Update Retreat
// -----------------------------------------------------------------------------
export const updateRetreat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, location, startDate, endDate, priceInr, imageUrl } = req.body;

    const retreat = await prisma.retreat.update({
      where: { id },
      data: {
        title, description, location, priceInr,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(imageUrl && { imageUrl }), 
      },
    });

    res.status(200).json({ message: 'Retreat updated successfully', retreat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update retreat' });
  }
};