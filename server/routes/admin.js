import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN, message: 'تم تسجيل الدخول بنجاح' });
  }
  res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === (process.env.ADMIN_TOKEN || 'dzboard_admin_2026')) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'غير مصرح' });
});

export default router;
