import express from 'express';
const router = express.Router();
import { verifyAdmin } from '../middleware/auth.js';
import validator from 'validator';

// Login endpoint with CSRF protection
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate inputs
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'بيانات غير صحيحة' });
    }
    
    // Sanitize inputs
    const cleanUsername = validator.escape(username.trim());
    
    // Get from environment variables (MUST be set)
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;
    
    if (!validUsername || !validPassword) {
      console.error('Admin credentials not configured in environment');
      return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
    
    // Verify credentials
    if (cleanUsername !== validUsername || password !== validPassword) {
      // Log failed attempt
      console.warn(`Failed admin login attempt for user: ${cleanUsername}`);
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }
    
    // Generate secure token from environment
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
      console.error('Admin token not configured in environment');
      return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
    
    // Set secure httpOnly cookie
    res.cookie('admin_token', token, {
      httpOnly: true,      // Not accessible from JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',  // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
    
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Verify admin session
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ success: true, message: 'جلسة صحيحة' });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

export default router;
