import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Route Imports
import authRoutes from './modules/users/auth.routes';
import courseRoutes from './modules/courses/course.routes';
import paymentRoutes from './modules/payments/payment.routes';
import sessionRoutes from './modules/sessions/session.routes';
import webinarRoutes from './modules/webinars/webinar.routes';
import blogRoutes from './modules/blogs/blog.routes';
import { sendEmail } from './core/services/mail.service';

dotenv.config();

const app: Application = express();

// -----------------------------------------------------------------------------
// 1. Cloud Infrastructure Setup (CRITICAL FOR DEPLOYMENT)
// -----------------------------------------------------------------------------
// If you host on Render, Heroku, AWS, or behind Cloudflare, you MUST trust the proxy
// otherwise the Rate Limiter will block all users thinking they share the same IP.
app.set('trust proxy', 1);

// -----------------------------------------------------------------------------
// 2. SECURE CORS (Must be absolute top so preflight passes!)
// -----------------------------------------------------------------------------
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  credentials: true,
}));

// -----------------------------------------------------------------------------
// 3. Enterprise Security Headers
// -----------------------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// -----------------------------------------------------------------------------
// 4. Global Rate Limiting (Adjusted for SPAs)
// -----------------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per IP (100 is too low for a React app loading images/data)
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// -----------------------------------------------------------------------------
// 5. THE RAZORPAY WEBHOOK BYPASS (MUST BE BEFORE EXPRESS.JSON)
// -----------------------------------------------------------------------------
// Razorpay signature validation will fail if express.json() formats the string.
// We capture the raw buffer ONLY for this specific webhook route.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse standard JSON for all other routes
app.use(express.json());

// -----------------------------------------------------------------------------
// 6. Create upload directories if they don't exist
// -----------------------------------------------------------------------------
const uploadDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const videosDir = path.join(uploadDir, 'videos');

[uploadDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// -----------------------------------------------------------------------------
// 7. Multer configuration for local file storage (Secured)
// -----------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else {
      cb(null, videosDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// -----------------------------------------------------------------------------
// 8. Serve static uploaded files (With explicit Cross-Origin Bypass)
// -----------------------------------------------------------------------------
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadDir));

// -----------------------------------------------------------------------------
// 9. Generic file upload endpoint (images & videos)
// -----------------------------------------------------------------------------
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const subfolder = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${subfolder}/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// -----------------------------------------------------------------------------
// 10. Health check
// -----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running perfectly.' });
});

// -----------------------------------------------------------------------------
// 11. Mount API routes
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/blogs', blogRoutes);

// -----------------------------------------------------------------------------
// 12. Temporary email test route
// -----------------------------------------------------------------------------
app.post('/api/test-email', async (req, res) => {
  try {
    const { targetEmail } = req.body;
    if (!targetEmail) {
      res.status(400).json({ error: 'Please provide a targetEmail in the body' });
      return;
    }
    console.log(`Attempting to send test email to ${targetEmail}...`);
    await sendEmail(
      targetEmail,
      'Test Mail: Shifting Into Awareness',
      `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #4A90E2;">Backend Integration Successful! 🚀</h2>
          <p>If you are reading this, your Amazon SES / Resend SMTP credentials are working perfectly inside your Node.js application.</p>
        </div>
      `
    );
    res.status(200).json({ message: `Success! Email fired off to ${targetEmail}` });
  } catch (error: any) {
    console.error('Test Email Failed:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

export default app;