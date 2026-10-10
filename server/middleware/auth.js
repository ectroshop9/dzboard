// ✅ Middleware التحقق من الأدمن - آمن (timing-safe)
export const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN;

  // ⚠️ يجب تعيين ADMIN_TOKEN في Vercel
  if (!validToken) {
    console.error('❌ ADMIN_TOKEN غير معين في البيئة!');
    return res.status(500).json({ success: false, message: 'خطأ في الإعدادات' });
  }

  if (!token || token.length !== validToken.length) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  // ✅ مقارنة آمنة (timing-safe)
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ validToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  next();
};
