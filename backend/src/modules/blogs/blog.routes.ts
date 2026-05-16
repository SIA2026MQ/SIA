import { Router } from 'express';
import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } from './blog.controller';
import { authenticateJWT, requireAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
// Endpoint: GET /api/blogs (List all blogs)
router.get('/', getAllBlogs);

// Endpoint: GET /api/blogs/:blogId (Read a single blog)
router.get('/:blogId', getBlogById);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
// Endpoint: POST /api/blogs (Write a new blog)
router.post('/', authenticateJWT, requireAdmin, createBlog);

// Endpoint: PUT /api/blogs/:blogId (Edit a blog)
router.put('/:blogId', authenticateJWT, requireAdmin, updateBlog);

// Endpoint: DELETE /api/blogs/:blogId (Delete a blog)
router.delete('/:blogId', authenticateJWT, requireAdmin, deleteBlog);

export default router;