import validator from 'validator';

export const validateOrder = (req, res, next) => {
  let { full_name, phone, wilaya_id, address, commune } = req.body;

  // 1. Validate full_name
  if (!full_name || typeof full_name !== 'string') {
    return res.status(400).json({ success: false, message: 'الاسم مطلوب' });
  }
  full_name = full_name.trim();
  if (full_name.length < 3) {
    return res.status(400).json({ success: false, message: 'الاسم قصير جداً' });
  }
  if (full_name.length > 100) {
    return res.status(400).json({ success: false, message: 'الاسم طويل جداً' });
  }
  req.body.full_name = full_name;

  // 2. Validate phone (تحويله لـ string وقبول الأرقام الجزائرية)
  phone = String(phone).trim();
  if (!phone) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }
  if (!/^0[5-7]\d{8}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'رقم هاتف غير صالح (يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام)' });
  }
  req.body.phone = phone;

  // 3. Validate wilaya_id (تحويل القيمة لـ Number لتفادي مشكلة String)
  const parsedWilaya = Number(wilaya_id);
  if (!wilaya_id || isNaN(parsedWilaya)) {
    return res.status(400).json({ success: false, message: 'الولاية مطلوبة' });
  }
  if (parsedWilaya < 1 || parsedWilaya > 58) {
    return res.status(400).json({ success: false, message: 'رقم الولاية غير صالح (من 1 إلى 58)' });
  }
  req.body.wilaya_id = parsedWilaya;

  // 4. Validate address
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ success: false, message: 'العنوان مطلوب' });
  }
  address = address.trim();
  if (address.length < 5) {
    return res.status(400).json({ success: false, message: 'العنوان قصير جداً' });
  }
  if (address.length > 200) {
    return res.status(400).json({ success: false, message: 'العنوان طويل جداً' });
  }
  req.body.address = address;

  // 5. Validate commune
  if (!commune || typeof commune !== 'string') {
    return res.status(400).json({ success: false, message: 'البلدية مطلوبة' });
  }
  commune = commune.trim();
  if (commune.length < 2) {
    return res.status(400).json({ success: false, message: 'البلدية قصيرة جداً' });
  }
  req.body.commune = commune;

  next();
};

export const validateProduct = (req, res, next) => {
  let { name, price, category, brand, stock, description } = req.body;

  // 1. Validate name
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'اسم المنتج مطلوب' });
  }
  name = name.trim();
  if (name.length < 3 || name.length > 100) {
    return res.status(400).json({ success: false, message: 'اسم المنتج يجب أن يكون بين 3 و 100 حرف' });
  }
  req.body.name = name;

  // 2. Validate price (قبول الأرقام المرسلة كـ Strings وتحويلها)
  const parsedPrice = Number(price);
  if (price === undefined || price === null || isNaN(parsedPrice)) {
    return res.status(400).json({ success: false, message: 'السعر مطلوب ويجب أن يكون رقماً' });
  }
  if (parsedPrice < 0 || parsedPrice > 999999) {
    return res.status(400).json({ success: false, message: 'السعر غير صالح' });
  }
  req.body.price = parsedPrice; // إرجاعه كـ Number

  // 3. Validate category
  const validCategories = ['tcon', 'alimentation', 'main-board', 'parts'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'فئة غير صالحة' });
  }

  // 4. Validate brand
  const validBrands = ['samsung', 'lg', 'condor', 'iris', 'geant', 'stream', 'maxtor', 'kiowa'];
  if (brand && !validBrands.includes(brand)) {
    return res.status(400).json({ success: false, message: 'علامة تجارية غير صالحة' });
  }

  // 5. Validate stock
  if (stock !== undefined && stock !== null && stock !== '') {
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, message: 'المخزون غير صالح' });
    }
    req.body.stock = parsedStock;
  }

  // 6. Sanitize description
  if (description) {
    if (typeof description !== 'string' || description.length > 500) {
      return res.status(400).json({ success: false, message: 'الوصف يجب ألا يتجاوز 500 حرف' });
    }
    req.body.description = description.trim();
  }

  next();
};