import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /backup - إنشاء نسخة احتياطية
router.get('/', async (req, res) => {
  try {
    // جلب جميع البيانات من الجداول
    const [productsResult, itemsResult, ordersResult, requestsResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory_items').select('*'),
      supabase.from('orders').select('*').catch(() => ({ data: [], error: null })),
      supabase.from('special_requests').select('*').catch(() => ({ data: [], error: null }))
    ]);

    if (productsResult.error) throw productsResult.error;
    if (itemsResult.error) throw itemsResult.error;

    const backupData = {
      version: '1.0',
      created_at: new Date().toISOString(),
      tables: {
        products: productsResult.data || [],
        inventory_items: itemsResult.data || [],
        orders: ordersResult.data || [],
        special_requests: requestsResult.data || []
      }
    };

    // إرسال كملف JSON للتنزيل
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(backupData, null, 2));

  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /backup/restore - استرجاع النسخة الاحتياطية
router.post('/restore', async (req, res) => {
  try {
    const backupData = req.body;
    
    if (!backupData || !backupData.tables) {
      return res.status(400).json({ success: false, error: 'بيانات غير صالحة' });
    }

    const { products, inventory_items, orders, special_requests } = backupData.tables;

    // استرجاع المنتجات
    if (products && products.length > 0) {
      // حذف البيانات الحالية
      await supabase.from('inventory_items').delete().neq('id', 0);
      await supabase.from('products').delete().neq('id', 0);
      
      // إعادة إدخال المنتجات
      for (const product of products) {
        const { id, created_at, updated_at, ...productData } = product;
        await supabase.from('products').insert(productData);
      }
    }

    // استرجاع قطع المخزون
    if (inventory_items && inventory_items.length > 0) {
      for (const item of inventory_items) {
        const { id, created_at, updated_at, ...itemData } = item;
        await supabase.from('inventory_items').insert(itemData);
      }
    }

    res.json({ success: true, message: 'تم استرجاع البيانات بنجاح' });

  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;