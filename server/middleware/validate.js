import validator from 'validator';

export const validateOrder = (req, res, next) => {
  const { full_name, phone, wilaya_id, address, commune } = req.body;
  
  // Validate full_name
  if (!full_name || typeof full_name !== 'string') {
    return res.status(400).json({ success: false, message: 'الاسم مطلوب' });
  }
  if (full_name.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'الاسم قصير جداً' });
  }
  if (full_name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'الاسم طويل جداً' });
  }
  // Sanitize name - remove potential XSS
  req.body.full_name = validator.escape(full_name.trim());
  
  // Validate phone
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }
  if (!/^0[5-7]\d{8}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'رقم هاتف غير صالح' });
  }
  
  // Validate wilaya_id
  if (!wilaya_id || typeof wilaya_id !== 'number') {
    return res.status(400).json({ success: false, message: 'الولاية مطلوبة' });
  }
  if (wilaya_id < 1 || wilaya_id > 58) {
    return res.status(400).json({ success: false, message: 'الولاية غير صالحة' });
  }
  
  // Validate address
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ success: false, message: 'العنوان مطلوب' });
  }
  if (address.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'العنوان قصير جداً' });
  }
  if (address.trim().length > 200) {
    return res.status(400).json({ success: false, message: 'العنوان طويل جداً' });
  }
  req.body.address = validator.escape(address.trim());
  
  // Validate commune
  if (!commune || typeof commune !== 'string') {
    return res.status(400).json({ success: false, message: 'البلدية مطلوبة' });
  }
  if (commune.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'البلدية قصيرة جداً' });
  }
  req.body.commune = validator.escape(commune.trim());
  
  next();
};

export const validateProduct = (req, res, next) => {
  const { name, price, category, brand, stock, description } = req.body;
  
  // Validate name
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'اسم المنتج مطلوب' });
  }
  if (name.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'اسم المنتج قصير جداً' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'اسم المنتج طويل جداً' });
  }
  req.body.name = validator.escape(name.trim());
  
  // Validate price
  if (price === undefined || price === null || typeof price !== 'number') {
    return res.status(400).json({ success: false, message: 'السعر مطلوب ويجب أن يكون رقم' });
  }
  if (price < 0 || price > 999999) {
    return res.status(400).json({ success: false, message: 'السعر غير صالح' });
  }
  req.body.price = parseFloat(price).toFixed(2);
  
  // Validate category
  const validCategories = ['tcon', 'alimentation', 'main-board', 'parts'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'فئة غير صالحة' });
  }
  
  // Validate brand
  const validBrands = ['samsung', 'lg', 'condor', 'iris', 'geant', 'stream', 'maxtor', 'kiowa'];
  if (brand && !validBrands.includes(brand)) {
    return res.status(400).json({ success: false, message: 'علامة تجارية غير صالحة' });
  }
  
  // Validate stock
  if (stock !== undefined && stock !== null) {
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: 'المخزون غير صالح' });
    }
  }
  
  // Sanitize description
  if (description) {
    if (typeof description !== 'string' || description.length > 500) {
      return res.status(400).json({ success: false, message: 'الوصف غير صالح' });
    }
    req.body.description = validator.escape(description.trim());
  }
  
  next();
};
