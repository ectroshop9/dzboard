exports.verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === (process.env.ADMIN_TOKEN || 'dzboard_admin_2026')) return next();
  res.status(401).json({ success: false, message: 'غير مصرح' });
};
