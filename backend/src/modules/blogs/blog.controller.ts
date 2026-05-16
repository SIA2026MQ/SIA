import { Request, Response } from 'express';
import { prisma } from '../../core/services/db.service';

// -----------------------------------------------------------------------------
// [ADMIN] Create a new Blog Post
// -----------------------------------------------------------------------------
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, contentHtml, imageUrlR2, youtubeUrl } = req.body;

    const newBlog = await prisma.blog.create({
      data: {
        title,
        contentHtml,
        imageUrlR2,
        youtubeUrl,
        isPublished: true, // Setting to true immediately for testing
      },
    });

    res.status(201).json({
      message: 'Blog published successfully',
      blog: newBlog
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC] Get all published Blogs (For the main Blog page)
// -----------------------------------------------------------------------------
export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }, // Newest blogs appear first
    });
    res.status(200).json({ blogs });
  } catch (error) {
    console.error('Fetch Blogs Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [PUBLIC] Get a single Blog by ID (For reading a specific article)
// -----------------------------------------------------------------------------
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.status(200).json({ blog });
  } catch (error) {
    console.error('Fetch Single Blog Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Update an existing Blog Post
// -----------------------------------------------------------------------------
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { title, contentHtml, imageUrlR2, youtubeUrl, isPublished } = req.body;

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        contentHtml,
        imageUrlR2,
        youtubeUrl,
        isPublished,
      },
    });

    res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    console.error('Update Blog Error:', error);
    res.status(500).json({ error: 'Internal server error or Blog not found' });
  }
};

// -----------------------------------------------------------------------------
// [ADMIN] Delete a Blog Post
// -----------------------------------------------------------------------------
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;

    await prisma.blog.delete({
      where: { id: blogId },
    });

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    res.status(500).json({ error: 'Internal server error or Blog not found' });
  }
};