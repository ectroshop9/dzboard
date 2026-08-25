import express from 'express';
const router = express.Router();
import axios from 'axios';

// خيارات الكوكي الموحدة والآمنة للربط عبر Cross-Domain (Vercel <-> Render)
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
  path: '/'
};

// ✅ Rate Limiting - منع هجمات التخمين
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 دقيقة

// ✅ التحقق من reCAPTCHA
async function verifyRecaptcha(token) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey || !token) return true; // ✅ إذا لم يوجد مفتاح - اسمح بالدخول

    const res = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );
    return res.data.success;
  } catch (error) {
    console.error('reCAPTCHA Error:', error.message);
    return false;
  }
}

// 1. مسار تسجيل الدخول (تسجيل الدخول وضبط الكوكي)
router.post('/login', async (req, res) => {
  const { username, password, recaptchaToken } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();

  // ✅ فحص Rate Limiting
  if (!loginAttempts[ip]) loginAttempts[ip] = [];
  loginAttempts[ip] = loginAttempts[ip].filter(t => now - t < BLOCK_DURATION);

  if (loginAttempts[ip].length >= MAX_ATTEMPTS) {
    return res.status(429).json({ 
      success: false, 
      message: 'محاولات كثيرة جداً - انتظر 15 دقيقة' 
    });
  }

  // ✅ التحقق من reCAPTCHA
  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) {
    loginAttempts[ip].push(now);
    return res.status(400).json({ 
      success: false, 
      message: 'فشل التحقق من reCAPTCHA' 
    });
  }

  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // ✅ مسح المحاولات عند النجاح
    delete loginAttempts[ip];
    
    // إرسال التوكن في كوكي محمي (HttpOnly Cookie)
    res.cookie('admin_token', ADMIN_TOKEN, cookieOptions);

    return res.json({ 
      success: true, 
      token: ADMIN_TOKEN,
      message: 'تم تسجيل الدخول بنجاح' 
    });
  }

  // ✅ تسجيل المحاولة الفاشلة
  loginAttempts[ip].push(now);
  const remaining = MAX_ATTEMPTS - loginAttempts[ip].length;

  res.status(401).json({ 
    success: false, 
    message: remaining > 0 
      ? `بيانات الدخول غير صحيحة - محاولات متبقية: ${remaining}` 
      : 'تم حظر المحاولات - انتظر 15 دقيقة'
  });
});

// 2. مسار التحقق من الجلسة (قراءة التوكن من الكوكي أو الهيدر)
router.get('/verify', (req, res) => {
  const tokenFromCookie = req.cookies?.admin_token;
  const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

  if (token && token === validToken) {
    return res.json({ success: true, message: 'الجلسة صالحة' });
  }

  res.status(401).json({ success: false, message: 'غير مصرح - يرجى تسجيل الدخول' });
});

// 3. مسار تسجيل الخروج (مسح الكوكي)
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', cookieOptions);
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

export default router;