import express from 'express';
const router = express.Router();
import { verifyAdmin } from '../middleware/auth.js';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
});

router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ success: true, message: 'Token صالح' });
});

export default router;
