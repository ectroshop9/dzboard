export const validateOrder = (req, res, next) => {
  const { full_name, phone, wilaya_id, address, commune } = req.body;
  
  if (!full_name || full_name.length < 3) {
    return res.status(400).json({ success: false, message: 'الاسم قصير جداً' });
  }
  if (!phone || !/^0[5-7]\d{8}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'رقم هاتف غير صالح' });
  }
  if (!wilaya_id || wilaya_id < 1 || wilaya_id > 58) {
    return res.status(400).json({ success: false, message: 'الولاية غير صالحة' });
  }
  if (!address || address.length < 5) {
    return res.status(400).json({ success: false, message: 'العنوان قصير جداً' });
  }
  if (!commune || commune.length < 2) {
    return res.status(400).json({ success: false, message: 'البلدية مطلوبة' });
  }
  
  next();
};

export const validateProduct = (req, res, next) => {
  const { name, price } = req.body;
  
  if (!name || name.length < 3) {
    return res.status(400).json({ success: false, message: 'اسم المنتج قصير جداً' });
  }
  if (!price || price < 0) {
    return res.status(400).json({ success: false, message: 'السعر غير صالح' });
  }
  
  next();
};
