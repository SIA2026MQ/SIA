import { Router } from 'express';
import {
  createCourse,
  getAllCourses,
  addVideoToCourse,
  deleteCourseVideo,
  getCourseById,
  requestVideoUploadUrl,
  getMyEnrolledCourses,
  markVideoCompleted,
  updateCourse,
  deleteCourse,
  initMultipartUpload,
  getMultipartUrls,
  finalizeMultipartUpload
} from './course.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ============================================================================
// STATIC ROUTES (before /:courseId)
// ============================================================================

// PUBLIC
router.get('/', getAllCourses);

// STUDENT
router.get('/enrolled/me', authenticateJWT, getMyEnrolledCourses);

// ADMIN: Standard Uploads
router.post('/upload-url', authenticateJWT, requireAdmin, requestVideoUploadUrl);
router.post('/', authenticateJWT, requireAdmin, createCourse);

// ADMIN: Multipart High-Speed Routes
router.post('/multipart/init', authenticateJWT, requireAdmin, initMultipartUpload);
router.post('/multipart/urls', authenticateJWT, requireAdmin, getMultipartUrls);
router.post('/multipart/complete', authenticateJWT, requireAdmin, finalizeMultipartUpload);

// ============================================================================
// DYNAMIC ROUTES (/:courseId)
// ============================================================================

// PUBLIC (access logic inside controller)
router.get('/:courseId', getCourseById);

// STUDENT
router.post('/:courseId/videos/:videoId/progress', authenticateJWT, markVideoCompleted);

// ADMIN
router.patch('/:courseId', authenticateJWT, requireAdmin, updateCourse);
router.post('/:courseId/videos', authenticateJWT, requireAdmin, addVideoToCourse);
router.delete('/:courseId', authenticateJWT, requireAdmin, deleteCourse);
router.delete('/:courseId/videos/:videoId', authenticateJWT, requireAdmin, deleteCourseVideo);

export default router;