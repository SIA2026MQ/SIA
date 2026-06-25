import { Router } from 'express';
import {
  createCourse,
  getAllCourses,
  addVideoToCourse,
  deleteCourseVideo,
  getCourseById,
  requestVideoUploadUrl,
  getMyEnrolledCourses,
  secureStreamHls,
  markVideoCompleted,
  updateCourse,
  deleteCourse,
  // 🚨 1. IMPORTING THE 3 MULTIPART FUNCTIONS
  initMultipartUpload,
  getMultipartUrls,
  finalizeMultipartUpload
} from './course.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ============================================================================
// STATIC ROUTES (Must go BEFORE /:courseId dynamic routes)
// ============================================================================

// PUBLIC
router.get('/', getAllCourses);

// STUDENT
router.get('/enrolled/me', authenticateJWT, getMyEnrolledCourses);

// ADMIN: Standard Uploads
router.post('/upload-url', authenticateJWT, requireAdmin, requestVideoUploadUrl);
router.post('/', authenticateJWT, requireAdmin, createCourse);

// 🚨 2. ADMIN: NEW MULTIPART HIGH-SPEED ROUTES
router.post('/multipart/init', authenticateJWT, requireAdmin, initMultipartUpload);
router.post('/multipart/urls', authenticateJWT, requireAdmin, getMultipartUrls);
router.post('/multipart/complete', authenticateJWT, requireAdmin, finalizeMultipartUpload);

// ============================================================================
// DYNAMIC ROUTES (/:courseId)
// ============================================================================

// PUBLIC
router.get('/:courseId', getCourseById);

// STUDENT
router.post('/:courseId/videos/:videoId/progress', authenticateJWT, markVideoCompleted);

// ENTERPRISE STREAMING ROUTE (HLS Proxy)
router.options('/secure-stream/:courseId/:videoId/:file', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.sendStatus(204);
});
router.get('/secure-stream/:courseId/:videoId/:file', authenticateJWT, secureStreamHls);

// ADMIN
router.patch('/:courseId', authenticateJWT, requireAdmin, updateCourse);
router.post('/:courseId/videos', authenticateJWT, requireAdmin, addVideoToCourse);
router.delete('/:courseId', authenticateJWT, requireAdmin, deleteCourse);
router.delete('/:courseId/videos/:videoId', authenticateJWT, requireAdmin, deleteCourseVideo);
export default router;