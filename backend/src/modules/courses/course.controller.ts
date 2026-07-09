import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

// S3 service imports – multipart uploads and signed URLs
import {
  generateUploadPresignedUrl,
  deleteFolderFromR2,
  startMultipartUpload,
  generatePartPresignedUrl,
  completeMultipartUpload,
  generateSignedUrl,            // ✅ NEW: for direct video streaming
} from '../../core/services/s3.service';

// -----------------------------------------------------------------------------
// CREATE COURSE
// -----------------------------------------------------------------------------
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priceInr, priceUsd, category, thumbnailUrl } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        priceInr,
        priceUsd,
        category: category || "Practices",
        thumbnailUrl,
        isPublished: true,
      },
    });
    res.status(201).json({ message: 'Course created.', course: newCourse });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

// -----------------------------------------------------------------------------
// GENERATE UPLOAD URL (standard single‑file upload)
// -----------------------------------------------------------------------------
export const requestVideoUploadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, contentType, courseId } = req.body;
    if (!fileName || !contentType || !courseId) {
      res.status(400).json({ error: 'Missing parameters' }); return;
    }
    const uniqueId = Date.now().toString() + '-' + Math.round(Math.random() * 1E9);
    const r2ObjectKey = `raw_uploads/course_${courseId}/${uniqueId}_${fileName.replace(/\s+/g, '_')}`;
    const uploadUrl = await generateUploadPresignedUrl(r2ObjectKey, contentType);

    res.status(200).json({ uploadUrl, r2ObjectKey });
  } catch (error) { res.status(500).json({ error: 'Failed to generate upload URL' }); }
};

// -----------------------------------------------------------------------------
// ADD VIDEO TO COURSE (no queue, no transcoding)
// -----------------------------------------------------------------------------
export const addVideoToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrlR2, orderIndex } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) { res.status(404).json({ error: 'Course not found' }); return; }

    // 🔥 Store the raw_uploads key directly – no worker, no processing
    const newVideo = await prisma.courseVideo.create({
      data: { courseId, title, description, videoUrlR2, orderIndex },
    });

    res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (error) {
    console.error('Add Video Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// GET ALL PUBLISHED COURSES (paginated)
// -----------------------------------------------------------------------------
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { isPublished: true },
        skip, take: limit,
        include: { videos: { orderBy: { orderIndex: 'asc' } } },
      }),
      prisma.course.count({ where: { isPublished: true } })
    ]);

    res.status(200).json({ courses, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

// -----------------------------------------------------------------------------
// GET COURSE BY ID – returns signed URLs for authorised users
// -----------------------------------------------------------------------------
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { videos: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!course) { res.status(404).json({ error: 'Course not found' }); return; }

    let hasAccess = false;
    let completedVideoIds: string[] = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        if (decodedToken.email) {
          const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });
          if (user) {
            if (user.role === 'ADMIN') { hasAccess = true; }
            else {
              const accessRecord = await prisma.courseAccess.findUnique({
                where: { userId_courseId: { userId: user.id, courseId } }
              });
              if (accessRecord) hasAccess = true;
            }

            if (hasAccess) {
              const progressRecords = await prisma.userVideoProgress.findMany({ where: { userId: user.id, courseId } });
              completedVideoIds = progressRecords.map(p => p.videoId);
            }
          }
        }
      } catch (err) { }
    }

    if (!hasAccess) {
      course.videos = course.videos.map(video => ({
        ...video,
        videoUrlR2: 'LOCKED - Purchase course to view',
      }));
    } else {
      // ✅ Replace each raw key with a time‑limited signed URL (2 hours)
      course.videos = await Promise.all(
        course.videos.map(async (video) => ({
          ...video,
          videoUrlR2: await generateSignedUrl(video.videoUrlR2),
        }))
      );
    }

    res.status(200).json({ course, hasAccess, completedVideoIds });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

// -----------------------------------------------------------------------------
// ENROLLED COURSES
// -----------------------------------------------------------------------------
export const getMyEnrolledCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const courseAccessLedger = await prisma.courseAccess.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true, description: true, category: true, thumbnailUrl: true } } },
      orderBy: { purchasedAt: 'desc' }
    });

    const enrolledCourses = courseAccessLedger.map(access => access.course);
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: { userId, isActive: true, expiryDate: { gte: new Date() } },
      include: { plan: true }
    });

    res.status(200).json({ courses: enrolledCourses, subscription: activeSubscription });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

// -----------------------------------------------------------------------------
// PROGRESS TRACKING
// -----------------------------------------------------------------------------
export const markVideoCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { courseId, videoId } = req.params;
    await prisma.userVideoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { isCompleted: true },
      create: { userId, videoId, courseId, isCompleted: true },
    });
    res.status(200).json({ success: true, message: 'Progress saved' });
  } catch (error) { res.status(500).json({ error: 'Failed to update progress' }); }
};

// -----------------------------------------------------------------------------
// UPDATE COURSE METADATA
// -----------------------------------------------------------------------------
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      priceInr,
      priceUsd,
      category,
      thumbnailUrl,
      duration,
      rating
    } = req.body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || undefined,
        description: description || undefined,
        category: category || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        duration: duration || undefined,
        priceInr: priceInr !== undefined ? Number(priceInr) : undefined,
        priceUsd: priceUsd !== undefined ? Number(priceUsd) : undefined,
        rating: rating !== undefined ? Number(rating) : undefined
      }
    });

    res.status(200).json({ message: 'Course updated', course: updated });
  } catch (error: any) {
    console.error("🔥 DATABASE ERROR IN UPDATE COURSE:", error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE COURSE (plus all videos & data)
// -----------------------------------------------------------------------------
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // 1. Delete from R2 – both raw uploads and any leftover processed folders
    try {
      await deleteFolderFromR2(`courses/${courseId}/`);
      await deleteFolderFromR2(`raw_uploads/course_${courseId}/`);
    } catch (r2Error) {
      console.warn(`⚠️ R2 Cleanup warning for course ${courseId} (folders might be empty already)`);
    }

    // 2. Remove related database records
    await prisma.courseAccess.deleteMany({ where: { courseId } });
    try { await (prisma as any).userVideoProgress.deleteMany({ where: { courseId } }); } catch(e) {}
    try { await (prisma as any).videoProgress.deleteMany({ where: { courseId } }); } catch(e) {}
    await prisma.courseVideo.deleteMany({ where: { courseId } });

    // 3. Finally delete the course
    await prisma.course.delete({ where: { id: courseId } });

    res.status(200).json({ message: 'Course permanently deleted.' });
  } catch (error: any) {
    console.error("🔥 DATABASE ERROR DELETING COURSE:", error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// -----------------------------------------------------------------------------
// MULTIPART UPLOAD HELPERS (unchanged)
// -----------------------------------------------------------------------------
export const initMultipartUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, contentType, courseId } = req.body;
    const uniqueId = Date.now().toString() + '-' + Math.round(Math.random() * 1E9);
    const r2ObjectKey = `raw_uploads/course_${courseId}/${uniqueId}_${fileName.replace(/\s+/g, '_')}`;

    const uploadId = await startMultipartUpload(r2ObjectKey, contentType);
    res.status(200).json({ uploadId, r2ObjectKey });
  } catch (error: any) {
    console.error("🔥 ERROR INIT MULTIPART:", error);
    res.status(500).json({ error: 'Failed to init multipart upload', details: error.message });
  }
};

export const getMultipartUrls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { r2ObjectKey, uploadId, partsCount } = req.body;

    if (!partsCount || partsCount <= 0) {
      res.status(400).json({ error: `Invalid partsCount received: ${partsCount}` });
      return;
    }

    const urlPromises = [];
    for (let i = 1; i <= partsCount; i++) {
      urlPromises.push(generatePartPresignedUrl(r2ObjectKey, uploadId, i));
    }
    const urls = await Promise.all(urlPromises);

    res.status(200).json({ urls });
  } catch (error: any) {
    console.error("🔥 ERROR GENERATING PART URLS:", error);
    res.status(500).json({ error: 'Failed to generate part URLs', details: error.message });
  }
};

export const finalizeMultipartUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { r2ObjectKey, uploadId, parts } = req.body;
    await completeMultipartUpload(r2ObjectKey, uploadId, parts);
    res.status(200).json({ message: "Upload complete" });
  } catch (error: any) {
    console.error("🔥 ERROR FINALIZING UPLOAD:", error);
    res.status(500).json({ error: 'Failed to complete upload', details: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE A SINGLE VIDEO (updated to delete raw file)
// -----------------------------------------------------------------------------
export const deleteCourseVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    console.log(`[BACKEND] 🗑️ Attempting to delete video: ${videoId}`);

    // 1. Remove progress records
    await (prisma as any).userVideoProgress.deleteMany({ where: { videoId } });

    // 2. Get the video record to know its R2 key
    const deletedVideo = await prisma.courseVideo.delete({ where: { id: videoId } });

    // 3. Delete the actual raw file from R2 (the key is stored directly)
    const r2Key = deletedVideo.videoUrlR2; // e.g., "raw_uploads/course_xxx/...mp4"
    await deleteFolderFromR2(r2Key);       // deletes that exact object

    res.status(200).json({ message: 'Video deleted from DB and Cloudflare' });
  } catch (error: any) {
    console.error("🔥 ERROR DELETING VIDEO:", error);
    res.status(500).json({ error: 'Failed to delete video', details: error.message });
  }
};