import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';

// -----------------------------------------------------------------------------
// [ADMIN] Create a Global Course Coupon (For Cart)
// -----------------------------------------------------------------------------
export const createCourseCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountPercent, maxUses, expiryDate } = req.body;

    // 🚨 THE FIX: Sanitize here exactly as we do in the frontend and validation!
    // This removes all leading/trailing spaces AND internal spaces, forcing uppercase.
    const sanitizedCode = code.trim().toUpperCase().replace(/\s+/g, '');

    if (!sanitizedCode || !discountPercent || !maxUses) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    // 2. Check for duplicates
    const existing = await prisma.coupon.findUnique({ where: { code: sanitizedCode } });
    if (existing) {
      res.status(400).json({ error: "This coupon code already exists." });
      return;
    }

    // 3. Create the coupon (Empty allowedEmails = Global Cart Coupon)
    const coupon = await prisma.coupon.create({
      data: {
        code: sanitizedCode,
        discountPercent: Number(discountPercent),
        maxUses: Number(maxUses),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        allowedEmails: [], // 🚨 The secret sauce: Empty array means ANY user can use it
      }
    });

    res.status(201).json({ message: "Course coupon created successfully", coupon });
  } catch (error) {
    console.error('Create Course Coupon Error:', error);
    res.status(500).json({ error: "Failed to create course coupon" });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Get all Global Course Coupons
// -----------------------------------------------------------------------------
export const getCourseCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 Fetch only coupons where allowedEmails is empty (Filters out group coupons)
    const coupons = await prisma.coupon.findMany({
      where: { allowedEmails: { equals: [] } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ coupons });
  } catch (error) {
    console.error('Get Course Coupons Error:', error);
    res.status(500).json({ error: "Failed to fetch course coupons" });
  }
};