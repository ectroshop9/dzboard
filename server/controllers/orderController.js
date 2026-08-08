import Order from '../models/Order.js';
import { ecotrackService } from '../services/ecotrack.js';
import validator from 'validator';

export const getAll = (req, res) => {
  try {
    const orders = Order.getAll();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};

export const create = async (req, res) => {
  try {
    const { full_name, phone, wilaya_id, commune, address, shipping_type, items, total_price, shipping_cost } = req.body;
    
    // Double-check required fields (validation middleware should catch this)
    if (!full_name || !phone || !address || !wilaya_id) {
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }
    
    // Validate shipping type
    if (!['domicile', 'stopdesk'].includes(shipping_type)) {
      return res.status(400).json({ success: false, message: 'نوع شحن غير صالح' });
    }
    
    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد منتجات' });
    }
    
    // Validate prices
    const total = parseFloat(total_price);
    const shipping = parseFloat(shipping_cost) || 0;
    if (isNaN(total) || total < 0 || isNaN(shipping) || shipping < 0) {
      return res.status(400).json({ success: false, message: 'سعر غير صالح' });
    }
    
    const order = Order.create({
      customer: full_name,
      phone,
      wilayaId: wilaya_id,
      commune,
      address,
      shippingType: shipping_type,
      items,
      amount: total,
      shipping: shipping,
    });
    
    // Try to create shipment with Ecotrack - don't fail if it doesn't work
    try {
      const ecoResult = await ecotrackService.createShipment(order);
      if (ecoResult.success) {
        Order.updateStatus(order.id, 'confirmed', ecoResult.tracking);
        console.log(`Order ${order.id} confirmed with tracking ${ecoResult.tracking}`);
      } else {
        console.warn(`Ecotrack error for order ${order.id}:`, ecoResult.error);
      }
    } catch (ecoError) {
      console.error(`Ecotrack service error for order ${order.id}:`, ecoError);
      // Order is still created even if Ecotrack fails
    }
    
    res.status(201).json({
      success: true,
      orderId: order.id,
      trackingNumber: order.tracking,
      message: 'تم إنشاء الطلب بنجاح',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الطلب' });
  }
};

export const updateStatus = (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
    }
    
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'معرف الطلب غير صالح' });
    }
    
    const order = Order.updateStatus(orderId, status);
    if (order) {
      console.log(`Order ${orderId} status updated to ${status}`);
      res.json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الطلب' });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { tracking } = req.params;
    const { phone } = req.query;
    
    // Validate phone parameter
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
    }
    
    if (!/^0[5-7]\d{8}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'رقم هاتف غير صالح' });
    }
    
    // Validate tracking number format
    if (!tracking || typeof tracking !== 'string' || tracking.length < 5) {
      return res.status(400).json({ success: false, message: 'رقم تتبع غير صالح' });
    }
    
    // Get order and verify phone matches
    const order = Order.getByTracking(tracking);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    
    // Verify phone number matches
    if (order.phone !== phone) {
      console.warn(`Unauthorized tracking attempt for order ${tracking}`);
      return res.status(403).json({ success: false, message: 'بيانات غير صحيحة' });
    }
    
    // Get tracking info from Ecotrack
    const trackingInfo = await ecotrackService.trackShipment(tracking);
    
    res.json({
      success: true,
      tracking: trackingInfo,
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'خطأ في تتبع الطلب' });
  }
};
