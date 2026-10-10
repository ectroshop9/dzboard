export const verifyAdmin = (req, res, next) => {
  const tokenFromCookie = req.cookies?.admin_token;
  const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
  const tokenFromQuery = req.query.admin_token;
  const token = tokenFromCookie || tokenFromHeader || tokenFromQuery;
  const validToken = process.env.ADMIN_TOKEN;

  if (!validToken) {
    console.error('❌ ADMIN_TOKEN غير معين!');
    return res.status(500).json({ success: false, message: 'خطأ' });
  }

  if (!token || token.length !== validToken.length) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ validToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  next();
};
