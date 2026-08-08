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
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://dzboard.vercel.app'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// CORS - يسمح للـ Vercel frontend فقط
const corsOptions = {
  origin: ['https://dzboard.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// Cookie Parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// Logging
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// CSRF Protection
const csrfProtection = csrf({ cookie: false });

// Routes
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', authLimiter, csrfProtection, adminRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, message: 'رمز CSRF غير صحيح' });
  }
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
