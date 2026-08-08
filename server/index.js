import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import shippingRoutes from './routes/shipping.js';

const app = express();

// ============ SECURITY MIDDLEWARE ============

// 1. Helmet - Sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// 2. Strict CORS - Allow only your frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://dzboard.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// 3. Request size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// 4. Cookie parser for CSRF protection
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// 5. Logging
app.use(morgan('combined'));

// 6. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'تم تجاوز الحد المسموح به من الطلبات. حاول لاحقاً.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 7. Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'محاولات دخول كثيرة. حاول لاحقاً.',
  skipSuccessfulRequests: true,
});

// 8. CSRF protection - must come after cookieParser
const csrfProtection = csrf({ cookie: false });

// ============ ROUTES ============

// Get CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', authLimiter, csrfProtection, adminRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  // CSRF error
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, message: 'رمز CSRF غير صحيح' });
  }

  // Log error but don't expose details
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
  });
});

export default app;
