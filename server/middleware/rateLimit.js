import rateLimit from 'express-rate-limit';

// ✅ الحد من رفع الصور (5 صور/ساعة لكل IP)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 5, // 5 صور
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح (5 صور/ساعة). حاول لاحقاً.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // استخدام IP + user-agent لتمييز أدق
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers['user-agent'] || '').substring(0, 50);
  }
});

// ✅ الحد من طلبات القطع الخاصة
export const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح (10 طلبات/ساعة). حاول لاحقاً.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ✅ الحد من الطلبات العادية (منع DDoS)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة
  max: 60, // 60 طلب
  message: {
    success: false,
    message: 'طلبات كثيرة جداً. انتظر دقيقة.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
