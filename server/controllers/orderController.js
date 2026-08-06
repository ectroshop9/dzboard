import Order from '../models/Order.js';

export const getAll = (req, res) => {
  res.json({ success: true, orders: Order.getAll() });
};

export const create = (req, res) => {
  const { full_name, phone, wilaya_id, commune, address, shipping_type, notes, items, total_price, shipping_cost } = req.body;
  
  if (!full_name || !phone || !address || !wilaya_id) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  }
  
  const tracking = 'ECG' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const order = Order.create({
    customer: full_name,
    phone,
    wilayaId: wilaya_id,
    commune,
    address,
    shippingType: shipping_type,
    notes,
    items,
    amount: total_price,
    shipping: shipping_cost,
    tracking,
  });
  
  res.status(201).json({ success: true, orderId: order.id, trackingNumber: order.tracking });
};

export const updateStatus = (req, res) => {
  const { status, tracking } = req.body;
  const order = Order.updateStatus(parseInt(req.params.id), status, tracking);
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  res.json({ success: true, order });
};
