import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import adminRoutes from './modules/admin/admin.routes';

// Route Imports
import authRoutes from './modules/users/auth.routes';
import courseRoutes from './modules/courses/course.routes';
import paymentRoutes from './modules/payments/payment.routes';
import sessionRoutes from './modules/sessions/session.routes';
import webinarRoutes from './modules/webinars/webinar.routes';
import blogRoutes from './modules/blogs/blog.routes';
import { sendEmail } from './core/services/mail.service';
import retreatRoutes from './modules/retreats/retreat.routes';

dotenv.config();

const app: Application = express();

// -----------------------------------------------------------------------------
// 1. Cloud Infrastructure Setup
// -----------------------------------------------------------------------------
app.set('trust proxy', 1);

// -----------------------------------------------------------------------------
// 2. SECURE CORS
// -----------------------------------------------------------------------------
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
// 4. Global Rate Limiting
// -----------------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// -----------------------------------------------------------------------------
// 5. THE RAZORPAY WEBHOOK BYPASS
// -----------------------------------------------------------------------------
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// -----------------------------------------------------------------------------
// 6. Cloudflare R2 (S3) Configuration
// -----------------------------------------------------------------------------
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// -----------------------------------------------------------------------------
// 7. Multer S3 Configuration (Direct Upload to Cloudflare)
// -----------------------------------------------------------------------------
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME || 'sia-assets',
    // Generate the path and filename in the bucket
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // 🚨 UPDATED: Now all images go to an 'images' folder instead of 'retreats'
      const folder = file.mimetype.startsWith('image/') ? 'raw_uploads/images/' : 'raw_uploads/videos/';
      const cleanFileName = file.originalname.replace(/\s+/g, '_');
      cb(null, folder + uniqueSuffix + '-' + cleanFileName);
    }
  }),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// -----------------------------------------------------------------------------
// 8. Generic file upload endpoint (With S3 Error Handling)
// -----------------------------------------------------------------------------
app.post('/api/upload', (req, res) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err: any) => {
    // 1. Catch S3 / Cloudflare Connection Errors
    if (err) {
      console.error("🚨 CLOUDFLARE/MULTER ERROR:", err);
      return res.status(500).json({ error: 'Upload to Cloudflare failed', details: err.message });
    }
    
    // 2. Catch Missing Files
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // 3. Success! Return the URL
    const fileKey = (req.file as any).key;
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
    
    res.json({ url: fileUrl });
  });
});

// -----------------------------------------------------------------------------
// 9. Health check
// -----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running perfectly.' });
});

// -----------------------------------------------------------------------------
// 10. Mount API routes
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/retreats', retreatRoutes);
app.use('/api/admin', adminRoutes);

export default app;