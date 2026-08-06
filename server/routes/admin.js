import express from 'express';
const router = express.Router();
import { verifyAdmin } from '../middleware/auth.js';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USERNAME || 'admin') && password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    return res.json({ success: true, token: process.env.ADMIN_TOKEN || 'dzboard_admin_2026' });
  }
  res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
});

router.get('/verify', verifyAdmin, (req, res) => res.json({ success: true }));

export default router;
