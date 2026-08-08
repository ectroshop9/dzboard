export const verifyAdmin = (req, res, next) => {
  try {
    // Get token from secure httpOnly cookie
    const token = req.cookies.admin_token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'غير مصرح - لم يتم العثور على التوكن' });
    }
    
    const validToken = process.env.ADMIN_TOKEN;
    if (!validToken || token !== validToken) {
      return res.status(401).json({ success: false, message: 'غير مصرح - توكن غير صحيح' });
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'خطأ في التحقق' });
  }
};

export const verifyAdminCookie = (req, res, next) => {
  const token = req.cookies?.admin_token;
  if (token === (process.env.ADMIN_TOKEN || 'dzboard_admin_2026')) {
    // تجديد الكوكي
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400000, // 24 ساعة
    });
    return next();
  }
  res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول' });
};
