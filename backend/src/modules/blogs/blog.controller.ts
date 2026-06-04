import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Destructure the exact keys sent by the frontend
    const { slug, title, category, excerpt, body, author, authorAvatar, date, readTime, image, youtubeUrl, isPublished, featured } = req.body;

    if (!slug || !title || !author) {
      res.status(400).json({ error: 'Missing required fields: slug, title, author' });
      return;
    }

    const newBlog = await prisma.blog.create({
      data: {
        slug,
        title,
        category: category || 'Spirituality',
        excerpt: excerpt || '',
        body: body || [],
        image: image || '',
        author,
        authorAvatar: authorAvatar || '',
        date: date || new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        readTime: readTime || '5 min read',
        youtubeUrl: youtubeUrl || '',
        isPublished: isPublished !== undefined ? isPublished : true,
        featured: featured || false,
      },
    });

    res.status(201).json({ blog: newBlog });
  } catch (error: any) {
    console.error('Create Blog Error:', error);
    // Security: Handle duplicate slugs securely without crashing server
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A blog post with this slug already exists.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ blogs });
  } catch (error: any) {
    console.error('Fetch Blogs Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    res.status(200).json({ blog });
  } catch (error: any) {
    console.error('Fetch Single Blog Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    res.status(200).json({ blog });
  } catch (error: any) {
    console.error('Fetch Blog By Slug Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { slug, title, category, excerpt, body, author, authorAvatar, date, readTime, image, youtubeUrl, isPublished, featured } = req.body;

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        slug,
        title,
        category,
        excerpt,
        body,
        author,
        authorAvatar,
        date,
        readTime,
        image,
        youtubeUrl,
        isPublished,
        featured
      },
    });

    res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error: any) {
    console.error('Update Blog Error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A blog post with this slug already exists.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    await prisma.blog.delete({ where: { id: blogId } });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error: any) {
    console.error('Delete Blog Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};