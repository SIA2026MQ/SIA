import { Response } from 'express';
import { prisma } from '../../core/services/db.service';

interface AuthRequest extends import('express').Request {
  user?: any;
}

/**
 * GET /api/admin/migrations/pending
 * Scans the database for registered users who have outstanding legacy orders.
 */
export const getPendingMigrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch all pending legacy orders
    const pendingOrders = await prisma.legacyOrder.findMany({
      where: { isMigrated: false }
    });

    if (pendingOrders.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // 2. Extract unique emails
    const uniqueEmails = [...new Set(pendingOrders.map(order => order.email))];

    // 3. Find which of those emails exist in our NEW platform's User table
    const registeredUsers = await prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      include: {
        courseAccess: {
          include: { course: true }
        }
      }
    });

    // 4. Map the data together
    const migrationData = registeredUsers.map(user => {
      const userPendingOrders = pendingOrders.filter(order => order.email === user.email);

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        alreadyActiveCourses: user.courseAccess.map(ca => ca.course.title),
        pendingLegacyCourses: userPendingOrders.map(order => ({
          id: order.id,
          courseName: order.courseName,
          orderNumber: order.orderNumber,
          purchasedAt: order.purchasedAt
        }))
      };
    });

    res.status(200).json({ success: true, data: migrationData });
  } catch (error) {
    console.error("Failed to fetch pending migrations:", error);
    res.status(500).json({ success: false, error: "Internal server error while fetching migrations" });
  }
};

/**
 * POST /api/admin/migrations/grant
 * Safely transfers the legacy orders into live course access using a smart-matching atomic transaction.
 */
export const verifyAndGrantAccess = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    res.status(400).json({ success: false, error: "Missing required user parameters" });
    return;
  }

  try {
    const legacyPurchases = await prisma.legacyOrder.findMany({
      where: { email: email, isMigrated: false }
    });

    if (legacyPurchases.length === 0) {
      res.status(404).json({ success: false, error: "No pending legacy records found for this email address" });
      return;
    }

    const liveCourses = await prisma.course.findMany({
      select: { id: true, title: true }
    });

    let grantedCount = 0;
    let notFoundCount = 0;
    const skippedCourseNames: string[] = [];

    // Perform a safe bulk assignment using an atomic transaction
    await prisma.$transaction(async (tx) => {
      for (const purchase of legacyPurchases) {

        // 🚨 SMART MATCHING LOGIC: 
        // Checks if names are identical OR if one contains the other (e.g. "Yoga Vashist (English)" matches "Yoga Vashist")
        const legacyName = purchase.courseName.toLowerCase().trim();
        const matchingCourse = liveCourses.find(c => {
          const liveName = c.title.toLowerCase().trim();
          return legacyName === liveName || legacyName.includes(liveName) || liveName.includes(legacyName);
        });

        if (matchingCourse) {
          // 1. Grant access cleanly directly into the CourseAccess table
          await tx.courseAccess.upsert({
            where: {
              userId_courseId: { userId, courseId: matchingCourse.id }
            },
            update: {}, // Do nothing if they already have it
            create: {
              userId,
              courseId: matchingCourse.id,
              purchasedAt: purchase.purchasedAt,
              // Required by your schema: Must be a unique Order ID
              orderId: `LEGACY_${purchase.orderNumber}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            }
          });

          // 2. ONLY mark as migrated because access was successfully granted!
          await tx.legacyOrder.update({
            where: { id: purchase.id },
            data: {
              isMigrated: true,
              migratedAt: new Date()
            }
          });
          grantedCount++;
        } else {
          // 🚨 THE CRITICAL FIX: If course is NOT found, we DO NOT mark it as migrated!
          notFoundCount++;
          skippedCourseNames.push(purchase.courseName);
          console.warn(`⚠️ Could not find a live course matching: "${purchase.courseName}"`);
        }
      }
    });

    // If it failed to match EVERYTHING for this user, throw an error
    if (grantedCount === 0 && notFoundCount > 0) {
      res.status(400).json({
        success: false,
        error: `Failed to migrate. Could not match any of these courses in your new database: ${skippedCourseNames.join(", ")}`
      });
      return;
    }

    // Success response (with warnings if some matched and some didn't)
    res.status(200).json({
      success: true,
      message: `Successfully transferred ${grantedCount} course(s) to Course Access.`,
      warnings: notFoundCount > 0 ? `Skipped ${notFoundCount} course(s) due to name mismatch: ${skippedCourseNames.join(", ")}` : undefined
    });

  } catch (error) {
    console.error("Execution failure on transactional grant operation:", error);
    res.status(500).json({ success: false, error: "Database transaction runtime fault" });
  }
};