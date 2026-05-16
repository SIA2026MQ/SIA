import { Router } from 'express';
import { createCourse, getAllCourses, addVideoToCourse, getCourseById } from './course.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/courses (Anyone can view the catalog)
router.get('/', getAllCourses);

// Endpoint: GET /api/courses/:courseId (Anyone can view a specific course curriculum)
router.get('/:courseId', getCourseById);

// Endpoint: POST /api/courses (ONLY Admins can create)
router.post('/', authenticateJWT, requireAdmin, createCourse);

// Endpoint: POST /api/courses/:courseId/videos (ONLY Admins can add videos)
router.post('/:courseId/videos', authenticateJWT, requireAdmin, addVideoToCourse);

export default router;