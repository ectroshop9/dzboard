const Order = require('../models/Order');
const { ecotrackService } = require('../services/ecotrack');

exports.getAll = (req, res) => {
  res.json({ success: true, orders: Order.getAll() });
};

exports.create = async (req, res) => {
  const { full_name, phone, wilaya_id, commune, address, shipping_type, notes, items, total_price, shipping_cost } = req.body;
  if (!full_name || !phone || !address || !wilaya_id) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  }
  
  const order = Order.create({ customer: full_name, phone, wilayaId: wilaya_id, commune, address, shippingType: shipping_type, notes, items, amount: total_price, shipping: shipping_cost });
  
  try {
    const result = await ecotrackService.createShipment(order);
    if (result.success) Order.updateStatus(order.id, 'confirmed', result.tracking);
  } catch (e) {}
  
  res.status(201).json({ success: true, orderId: order.id, trackingNumber: order.tracking });
};

exports.updateStatus = (req, res) => {
  const order = Order.updateStatus(parseInt(req.params.id), req.body.status, req.body.tracking);
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  res.json({ success: true, order });
};

exports.trackOrder = async (req, res) => {
  const result = await ecotrackService.trackShipment(req.params.tracking);
  res.json({ success: true, tracking: result });
};
