const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }
  next();
};
