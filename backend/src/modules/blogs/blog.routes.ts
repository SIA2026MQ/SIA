import { Router } from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from './blog.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/', getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);   
router.get('/:blogId', getBlogById);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.post('/', authenticateJWT, requireAdmin, createBlog);
router.put('/:blogId', authenticateJWT, requireAdmin, updateBlog);
router.delete('/:blogId', authenticateJWT, requireAdmin, deleteBlog);

export default router;