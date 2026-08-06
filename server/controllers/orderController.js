import Order from '../models/Order.js';
import { ecotrackService } from '../services/ecotrack.js';

export const getAll = (req, res) => {
  res.json({ success: true, orders: Order.getAll() });
};

export const create = async (req, res) => {
  const { full_name, phone, wilaya_id, commune, address, shipping_type, notes, items, total_price, shipping_cost } = req.body;
  
  if (!full_name || !phone || !address || !wilaya_id) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  }
  
  // إنشاء الطلب محلياً
  const order = Order.create({
    customer: full_name,
    phone,
    wilayaId: wilaya_id,
    commune: commune || '',
    address,
    shippingType: shipping_type || 'domicile',
    notes: notes || '',
    items: items || [],
    amount: total_price || 0,
    shipping: shipping_cost || 0,
  });

  // إرسال لـ ECOTRACK
  try {
    const ecotrackResult = await ecotrackService.createShipment(order);
    
    if (ecotrackResult.success) {
      // تحديث الطلب برقم التتبع
      Order.updateStatus(order.id, 'confirmed', ecotrackResult.tracking);
      order.tracking = ecotrackResult.tracking;
      order.status = 'confirmed';
    } else {
      console.warn('ECOTRACK warning:', ecotrackResult.error);
    }
  } catch (error) {
    console.error('ECOTRACK error:', error);
  }
  
  res.status(201).json({ 
    success: true, 
    orderId: order.id,
    trackingNumber: order.tracking,
  });
};

export const updateStatus = (req, res) => {
  const { status, tracking } = req.body;
  const order = Order.updateStatus(parseInt(req.params.id), status, tracking);
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  res.json({ success: true, order });
};

// تتبع شحنة من ECOTRACK
export const trackOrder = async (req, res) => {
  const { tracking } = req.params;
  
  try {
    const result = await ecotrackService.trackShipment(tracking);
    res.json({ success: true, tracking: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تتبع الشحنة' });
  }
};
