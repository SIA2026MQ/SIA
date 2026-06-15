import { Response } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { prisma } from '../../core/services/db.service';
import { sendGroupCouponEmail } from '../../core/services/mail.service';

// -----------------------------------------------------------------------------
// [AUTHENTICATED USER] Submit a request for a group discount
// -----------------------------------------------------------------------------
export const submitGroupRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberCount, emails } = req.body;
    
    await prisma.groupDiscountRequest.create({
      data: {
        userId: req.user!.id,
        memberCount,
        emails // Array of strings like ["friend1@gmail.com", "friend2@gmail.com"]
      }
    });
    
    res.status(200).json({ message: "Request sent to Admin successfully!" });
  } catch (error) {
    console.error('Group Request Error:', error);
    res.status(500).json({ error: "Failed to submit group request" });
  }
};

// -----------------------------------------------------------------------------
// [AUTHENTICATED USER] Validate a coupon code during checkout
// -----------------------------------------------------------------------------
export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userEmail = req.user!.email; // Requires the authenticateJWT middleware

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      res.status(400).json({ error: "Invalid coupon code." });
      return;
    }
    
    // 🚨 ANTI-FRAUD CHECK: Ensure the user's email is in the allowed list
    if (coupon.allowedEmails.length > 0 && !coupon.allowedEmails.includes(userEmail)) {
      res.status(403).json({ error: "This coupon is strictly registered to a different email address." });
      return;
    }

    // Check usage limits and expiration
    if (coupon.usedCount >= coupon.maxUses) {
      res.status(400).json({ error: "Coupon usage limit reached." });
      return;
    }
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      res.status(400).json({ error: "Coupon has expired." });
      return;
    }

    res.status(200).json({ discountPercent: coupon.discountPercent, couponId: coupon.id });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Get all group discount requests
// -----------------------------------------------------------------------------
export const getAdminGroupRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.groupDiscountRequest.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Also fetch active coupons so the admin panel has everything it needs
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ requests, coupons });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Approve Request & Generate Coupon
// -----------------------------------------------------------------------------
export const approveGroupRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { discountPercent } = req.body;

    // 1. Find the request
    const groupReq = await prisma.groupDiscountRequest.findUnique({ 
      where: { id: requestId },
      include: { user: true }
    });

    if (!groupReq) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // 2. Generate a secure, unique code
    const code = `SIA-GROUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const allowedEmails = [...groupReq.emails, groupReq.user.email];

    // 3. Create the Coupon bound ONLY to these emails
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountPercent: Number(discountPercent),
        maxUses: allowedEmails.length,
        allowedEmails,
      }
    });

    // 4. Mark request as approved
    await prisma.groupDiscountRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    // This sends the email to everyone in the 'allowedEmails' array
    await sendGroupCouponEmail(allowedEmails, code, Number(discountPercent), groupReq.user.name);

    res.status(200).json({ message: "Coupon generated successfully", coupon });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve request" });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Delete a Coupon
// -----------------------------------------------------------------------------
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};