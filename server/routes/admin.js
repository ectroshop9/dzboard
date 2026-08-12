import express from 'express';
const router = express.Router();

// خيارات الكوكي الموحدة والآمنة للربط عبر Cross-Domain (Vercel <-> Render)
const cookieOptions = {
  httpOnly: true,
  secure: true, // ضروري مع HTTPS و sameSite: 'none'
  sameSite: 'none', // يسمح للمتصفح بإرسال الكوكي من Vercel إلى Render
  maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
  path: '/'
};

// 1. مسار تسجيل الدخول (تسجيل الدخول وضبط الكوكي)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // إرسال التوكن في كوكي محمي (HttpOnly Cookie)
    res.cookie('admin_token', ADMIN_TOKEN, cookieOptions);

    return res.json({ 
      success: true, 
      token: ADMIN_TOKEN, // يدعم التطبيق والواجهة الأمامية القديمة والحديثة
      message: 'تم تسجيل الدخول بنجاح' 
    });
  }

  res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
});

// 2. مسار التحقق من الجلسة (قراءة التوكن من الكوكي أو الهيدر)
router.get('/verify', (req, res) => {
  // قراءة التوكن إما من الكوكي أو من الهيدر (لضمان عمل الطريقتين دون توقف)
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