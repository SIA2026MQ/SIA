import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/users/auth.routes';
import courseRoutes from './modules/courses/course.routes';
import paymentRoutes from './modules/payments/payment.routes';
import sessionRoutes from './modules/sessions/session.routes';
import webinarRoutes from './modules/webinars/webinar.routes';
import blogRoutes from './modules/blogs/blog.routes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sendEmail } from './core/services/mail.service';

dotenv.config();

const app: Application = express();

// 1. Enterprise Security Headers
app.use(helmet());

// 2. Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 3. SECURE CORS CONFIGURATION (Fixes the login loop!)
app.use(cors({
  origin: ['http://localhost:8080'], // Explicitly trust your Vite frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow the Bearer token
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running perfectly.' });
});

// Mount the Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/blogs', blogRoutes);

// ⚠️ TEMPORARY POSTMAN TEST ROUTE - WE WILL DELETE THIS LATER
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