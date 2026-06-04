import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';
import { generateSignedUrl, generateUploadPresignedUrl } from '../../core/services/s3.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Create a new course
// -----------------------------------------------------------------------------
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priceInr, priceUsd } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        priceInr,
        priceUsd,
        isPublished: true,
      },
    });

    res.status(201).json({
      message: 'Course created and published successfully.',
      course: newCourse,
    });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Request Direct-to-R2 Upload URL (The Phase 1 Gateway)
// -----------------------------------------------------------------------------
export const requestVideoUploadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, contentType, courseId } = req.body;

    if (!fileName || !contentType || !courseId) {
      res.status(400).json({ error: 'Missing required parameters (fileName, contentType, courseId)' });
      return;
    }

    // Generate a highly unique, collision-proof path in Cloudflare R2
    const uniqueId = Date.now().toString() + '-' + Math.round(Math.random() * 1E9);

    // Example: raw_uploads/course_123/1780124_my_video.mp4
    const r2ObjectKey = `raw_uploads/course_${courseId}/${uniqueId}_${fileName.replace(/\s+/g, '_')}`;

    // Generate the VIP Pass
    const uploadUrl = await generateUploadPresignedUrl(r2ObjectKey, contentType);

    res.status(200).json({
      uploadUrl,     // React will use this to PUT the file
      r2ObjectKey,   // React will send this back when the upload finishes
      message: 'Upload URL generated successfully.'
    });

  } catch (error) {
    console.error('Presigned URL Error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Add a video to an existing course
// -----------------------------------------------------------------------------
export const addVideoToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrlR2, orderIndex } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const newVideo = await prisma.courseVideo.create({
      data: {
        courseId,
        title,
        description,
        videoUrlR2,
        orderIndex,
      },
    });

    res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (error) {
    console.error('Add Video Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC] Get all published courses (Paginated)
// -----------------------------------------------------------------------------
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        include: { videos: { orderBy: { orderIndex: 'asc' } } },
      }),
      prisma.course.count({ where: { isPublished: true } })
    ]);

    res.status(200).json({
      courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC/STUDENT] Get a single course (Dynamic Firebase Security Lock)
// -----------------------------------------------------------------------------
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        videos: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    let hasAccess = false;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

        if (decodedToken.email) {
          const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });

          if (user) {
            if (user.role === 'ADMIN') {
              hasAccess = true;
            } else {
              const accessRecord = await prisma.courseAccess.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseId } }
              });
              if (accessRecord) hasAccess = true;
            }
          }
        }
      } catch (err) {
        // Token expired/invalid
      }
    }

    if (!hasAccess) {
      course.videos = course.videos.map(video => ({
        ...video,
        videoUrlR2: 'LOCKED - Purchase course to view',
      }));
    } else {
      course.videos = await Promise.all(course.videos.map(async (video) => ({
        ...video,
        videoUrlR2: await generateSignedUrl(video.videoUrlR2)
      })));
    }

    res.status(200).json({ course, hasAccess });

  } catch (error) {
    console.error('Fetch Course Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};