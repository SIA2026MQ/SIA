import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';

// -----------------------------------------------------------------------------
// Dashboard Stats (Updated to include Users & Subscriptions)
// -----------------------------------------------------------------------------
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Run all counts at the exact same time for maximum speed
    const [
      coursesCount,
      webinarsCount,
      blogsCount,
      couponsCount,
      inquiriesCount,
      usersCount,             // 🚨 NEW: Added User Count
      subscriptionsCount      // 🚨 NEW: Added Subscription Count
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
    const search = (req.query.search as string) || ""; // 🚨 Capture search query
    const limit = 10;
    const skip = (page - 1) * limit;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 🚨 Create the search filter
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
          
          // 🚨 FIXED: Now fetches ALL attendances, not just today's
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
    const { id } = req.params;
    const { level } = req.body;

    if (typeof level !== 'number' || level < 0) {
      res.status(400).json({ error: "Level must be a positive number." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { level },
    });

    res.status(200).json({ message: "User level updated", level: updatedUser.level });
  } catch (error) {
    console.error("Update Level Error:", error);
    res.status(500).json({ error: "Failed to update user level." });
  }
};

export const toggleUserBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    console.log(`[BLOCK TOGGLE] User ID: ${id} | Target Status:`, isBlocked);

    // Explicitly enforce boolean typing
    const blockStatus = isBlocked === true || isBlocked === "true";

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: blockStatus },
    });

    res.status(200).json({ message: "User block status updated", isBlocked: updatedUser.isBlocked });
  } catch (error) {
    // 🚨 THIS WILL PRINT THE EXACT REASON IT IS FAILING TO YOUR TERMINAL
    console.error("🔥 DATABASE ERROR IN TOGGLE BLOCK:", error);
    res.status(500).json({ error: "Failed to update block status." });
  }
};