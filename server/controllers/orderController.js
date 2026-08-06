import Order from '../models/Order.js';
import { ecotrackService } from '../services/ecotrack.js';

export const getAll = (req, res) => res.json({ success: true, orders: Order.getAll() });

export const create = async (req, res) => {
  const { full_name, phone, wilaya_id, commune, address, shipping_type, items, total_price, shipping_cost } = req.body;
  if (!full_name || !phone || !address || !wilaya_id) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  
  const order = Order.create({ customer: full_name, phone, wilayaId: wilaya_id, commune, address, shippingType: shipping_type, items, amount: total_price, shipping: shipping_cost });
  
  try { const r = await ecotrackService.createShipment(order); if (r.success) Order.updateStatus(order.id, 'confirmed', r.tracking); } catch (e) {}
  
  res.status(201).json({ success: true, orderId: order.id, trackingNumber: order.tracking });
};

export const updateStatus = (req, res) => {
  const o = Order.updateStatus(parseInt(req.params.id), req.body.status);
  o ? res.json({ success: true, order: o }) : res.status(404).json({ success: false });
};

export const trackOrder = async (req, res) => {
  const r = await ecotrackService.trackShipment(req.params.tracking);
  res.json({ success: true, tracking: r });
};
