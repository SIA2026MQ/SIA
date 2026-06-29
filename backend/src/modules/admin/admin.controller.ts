import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
// 🚨 NEW: Make sure this path matches where your bullmq queues are exported!
import { emailQueue } from '../../core/services/queue.service'; 

// -----------------------------------------------------------------------------
// Dashboard Stats (Updated to include Users & Subscriptions)
// -----------------------------------------------------------------------------
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      coursesCount,
      webinarsCount,
      blogsCount,
      couponsCount,
      inquiriesCount,
      usersCount,            
      subscriptionsCount      
    ] = await Promise.all([
      prisma.course.count(),
      prisma.webinar.count(),
      prisma.blog.count(),
      prisma.coupon.count(),
      prisma.retreatApplication.count(), 
      prisma.user.count(),             
      prisma.subscriptionPlan.count()  
    ]);

    res.status(200).json({
      courses: coursesCount,
      webinars: webinarsCount,
      blogs: blogsCount,
      coupons: couponsCount,
      inquiries: inquiriesCount,
      users: usersCount,
      subscriptions: subscriptionsCount
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// -----------------------------------------------------------------------------
// Get Paginated Users with All Stats
// -----------------------------------------------------------------------------
export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = (req.query.search as string) || ""; 
    const limit = 10;
    const skip = (page - 1) * limit;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause, 
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          courseAccess: { include: { course: true } },
          subscription: { include: { plan: true } },
          retreatApplications: { where: { status: 'PAID' }, include: { retreat: true } },
          attendances: true 
        }
      }),
      prisma.user.count({ where: whereClause }) 
    ]);

    res.status(200).json({
      users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// -----------------------------------------------------------------------------
// Update User Level
// -----------------------------------------------------------------------------
export const updateUserLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 FIX: Safely grab the ID whether the router calls it :userId or :id
    const targetId = req.params.userId || req.params.id;
    const { level } = req.body;

    if (!targetId) {
      res.status(400).json({ error: "User ID parameter is missing from the route." });
      return;
    }

    if (typeof level !== 'number' || level < 0) {
      res.status(400).json({ error: "Level must be a positive number." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: { level },
    });

    res.status(200).json({ message: "User level updated", level: updatedUser.level });
  } catch (error) {
    console.error("Update Level Error:", error);
    res.status(500).json({ error: "Failed to update user level." });
  }
};

// -----------------------------------------------------------------------------
// Toggle User Block Status
// -----------------------------------------------------------------------------
export const toggleUserBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    // Safely grab the ID whether the router calls it :userId or :id
    const targetId = req.params.userId || req.params.id;
    const { isBlocked } = req.body;

    if (!targetId) {
      res.status(400).json({ error: "User ID parameter is missing from the route." });
      return;
    }

    console.log(`[BLOCK TOGGLE] User ID: ${targetId} | Target Status:`, isBlocked);

    const blockStatus = isBlocked === true || isBlocked === "true";

    // 1. Update the database first
    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: { isBlocked: blockStatus },
    });

    // 2. Trigger the email worker safely
    if (blockStatus === true) {
      try {
        await emailQueue.add('account-blocked', {
          email: updatedUser.email,
          name: updatedUser.name
        });
      } catch (queueError: any) {
        // 🚨 If Redis/BullMQ fails, we log it but DON'T crash the request!
        console.warn(`⚠️ User was blocked, but email queue failed: ${queueError.message}`);
      }
    }

    // 3. Return success to the frontend
    res.status(200).json({ message: "User block status updated", isBlocked: updatedUser.isBlocked });
    
  } catch (error: any) {
    console.error("🔥 DATABASE ERROR IN TOGGLE BLOCK:", error);
    res.status(500).json({ error: "Failed to update block status.", details: error.message });
  }
};