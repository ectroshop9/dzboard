// ✅ Rate Limiting بسيط وفعال (بدون مكتبات خارجية)
const requests = new Map();

export const rateLimit = (maxRequests = 60, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip).filter(time => now - time < windowMs);
    
    if (userRequests.length >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ 
        success: false, 
        message: 'طلبات كثيرة. حاول لاحقاً.' 
      });
    }
    
    userRequests.push(now);
    requests.set(ip, userRequests);
    
    // تنظيف دوري (1% chance)
    if (Math.random() < 0.01) {
      for (const [key, value] of requests.entries()) {
        const filtered = value.filter(time => now - time < windowMs);
        if (filtered.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, filtered);
        }
      }
    }
    
    next();
  };
};

// ✅ حدود مخصصة
export const generalLimiter = rateLimit(100, 60 * 1000);     // 100/دقيقة
export const authLimiter = rateLimit(5, 15 * 60 * 1000);     // 5/15 دقيقة
export const uploadLimiter = rateLimit(20, 60 * 60 * 1000);  // 20/ساعة
