import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { videoQueue } from '../../core/services/queue.service';

// 🚨 FIXED: Imported the missing multipart S3 functions here!
import { 
  generateUploadPresignedUrl, 
  deleteFolderFromR2,
  startMultipartUpload,
  generatePartPresignedUrl,
  completeMultipartUpload
} from '../../core/services/s3.service';

// -----------------------------------------------------------------------------
// [INFRASTRUCTURE] Standalone R2 Client for direct byte-streaming
// -----------------------------------------------------------------------------
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

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

export const addVideoToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrlR2, orderIndex } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) { res.status(404).json({ error: 'Course not found' }); return; }

    const newVideo = await prisma.courseVideo.create({
      data: { courseId, title, description, videoUrlR2, orderIndex },
    });

    await videoQueue.add('process-video', {
      videoId: newVideo.id,
      r2ObjectKey: videoUrlR2,
      courseId: courseId,
      title: title 
    });

    res.status(201).json({ message: 'Video added and sent to processing queue', video: newVideo });
  } catch (error) {
    console.error('Add Video Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
      course.videos = course.videos.map((video) => ({
        ...video,
        videoUrlR2: `${req.protocol}://${req.get('host')}/api/courses/secure-stream/${courseId}/${video.id}/master.m3u8`
      }));
    }

    res.status(200).json({ course, hasAccess, completedVideoIds });
  } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
};

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

export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // 1. SAFELY delete files from Cloudflare R2
    // We wrap this in a try/catch so if the folder is already empty, it doesn't crash the database deletion!
    try {
      await deleteFolderFromR2(`courses/${courseId}/`);
      await deleteFolderFromR2(`raw_uploads/course_${courseId}/`);
    } catch (r2Error) {
      console.warn(`⚠️ R2 Cleanup warning for course ${courseId} (folders might be empty already)`);
    }

    // 2. CASCADE DELETE: Remove all related database records first so Prisma doesn't panic
    await prisma.courseAccess.deleteMany({ where: { courseId } });
    
    // Safety check: depending on what you named the progress model in Prisma
    try { await (prisma as any).userVideoProgress.deleteMany({ where: { courseId } }); } catch(e) {}
    try { await (prisma as any).videoProgress.deleteMany({ where: { courseId } }); } catch(e) {}

    await prisma.courseVideo.deleteMany({ where: { courseId } });
    
    // 3. Finally, delete the Course itself
    await prisma.course.delete({ where: { id: courseId } });

    res.status(200).json({ message: 'Course permanently deleted.' });
  } catch (error: any) { 
    // 🚨 If it STILL fails, this prints the exact reason to your backend terminal
    console.error("🔥 DATABASE ERROR DELETING COURSE:", error);
    res.status(500).json({ error: 'Internal server error', details: error.message }); 
  }
};

export const secureStreamHls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { courseId, videoId, file } = req.params;

    if (!file) { 
      res.status(400).json({ error: 'Missing file payload.' }); 
      return; 
    }

    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');

    let hasAccess = false;
    if (req.user!.role === 'ADMIN') { hasAccess = true; }
    else {
      const accessRecord = await prisma.courseAccess.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });
      if (accessRecord) hasAccess = true;
    }

    if (!hasAccess) { res.status(403).json({ error: 'Access Denied.' }); return; }

    const r2BucketName = process.env.R2_BUCKET_NAME || '';
    const r2ObjectKey = `courses/${courseId}/${videoId}/${file}`;

    const command = new GetObjectCommand({ Bucket: r2BucketName, Key: r2ObjectKey });
    const s3Response = await s3Client.send(command);

    if (file.endsWith('.m3u8')) res.setHeader('Content-Type', 'application/x-mpegURL');
    else if (file.endsWith('.ts')) res.setHeader('Content-Type', 'video/MP2T');

    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const stream = s3Response.Body as any;
    stream.pipe(res);

    req.on('close', () => { if (stream && typeof stream.destroy === 'function') stream.destroy(); });

  } catch (error: any) {
    console.error('🚨 [STREAM PROXY ERROR]:', error.name, '->', error.message);
    res.status(404).json({ error: 'Requested video chunk missing.' });
  }
};

// -----------------------------------------------------------------------------
// 🚨 MISSING MULTIPART UPLOAD CONTROLLERS (RESTORED HERE)
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

export const deleteCourseVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    console.log(`[BACKEND] 🗑️ Attempting to delete video: ${videoId}`);

    // 1. Delete progress records so we don't have FK constraints
    await (prisma as any).userVideoProgress.deleteMany({ where: { videoId } });

    // 2. Delete the actual video record from DB
    const deletedVideo = await prisma.courseVideo.delete({ where: { id: videoId } });
    
    // 3. Delete from Cloudflare R2 using the URL we just got from the DB
    // We parse the object key from the DB path
    const r2Key = deletedVideo.videoUrlR2.replace('courses/', ''); 
    await deleteFolderFromR2(`courses/${r2Key.split('/master')[0]}/`);

    res.status(200).json({ message: 'Video deleted from DB and Cloudflare' });
  } catch (error: any) {
    console.error("🔥 ERROR DELETING VIDEO:", error);
    res.status(500).json({ error: 'Failed to delete video', details: error.message });
  }
};