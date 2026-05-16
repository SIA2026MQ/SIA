import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';
import { firebaseAdmin } from '../../core/services/firebase.service';
import { emailQueue } from '../../core/services/queue.service';
import { generateSignedUrl } from '../../core/services/s3.service'; // Adjust path if you renamed this to r2.service

// -----------------------------------------------------------------------------
// [ADMIN ONLY] Create a new course & trigger mass email
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

    // Throw the mass-email task into the Redis Queue instantly!
    await emailQueue.add('mass-notification', {
      type: 'NEW_COURSE',
      courseId: newCourse.id,
      title: newCourse.title,
    });

    res.status(201).json({
      message: 'Course created successfully. Notifications are sending in the background!',
      course: newCourse,
    });
  } catch (error) {
    console.error('Create Course Error:', error);
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
    
    // Check if the user sent a Firebase Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        // 1. Verify token with Firebase
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        // 2. Find the user in our DB to check their role and purchases
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
        // Token expired/invalid -> Ignore and treat as logged out guest
      }
    }

    // Strip the video URLs if they do NOT have access
    if (!hasAccess) {
      course.videos = course.videos.map(video => ({
        ...video,
        videoUrlR2: 'LOCKED - Purchase course to view',
      }));
    } else {
      // Generate expiring URLs dynamically for authorized users
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