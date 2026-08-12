import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /items - جلب القطع وإضافة تفاصيل المنتج المربوط بها
router.get('/items', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('inventory_items').select('*').order('id', { ascending: false });
    
    if (search) {
      query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    
    const { data: items, error } = await query;
    if (error) return res.status(500).json({ success: false, error });

    // دمج تفاصيل المنتج مع كل قطعة مخزون
    for (let item of (items || [])) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('image,price')
          .eq('id', item.product_id)
          .single();
          
        if (product) {
          item.image = product.image;
          item.price = product.price;
        }
      }
    }

    res.json({ success: true, items: items || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /items - إضافة قطعة أو أكثر ومزامنة الكمية مع جدول المنتجات
router.post('/items', async (req, res) => {
  try {
    // 1. استقبال البيانات والكمية (افتراضياً 1)
    const { name, shelf, position, price, image, category, brand, quantity = 1 } = req.body;
    const qtyNum = parseInt(quantity, 10) || 1;

    // 2. إنشاء المنتج في جدول products مع ضبط الرصيد (stock) بحسب الكمية
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        price: price || 0,
        stock: qtyNum, // ضبط الكمية هنا
        active: true,
        category: category || 'parts',
        brand: brand || 'generic',
        image: image || '',
        description: `${shelf} - ${position || ''}`
      })
      .select()
      .single();

    if (productError) return res.status(500).json({ success: false, error: productError });

    // 3. جلب العدد الحالي للقطع لإنشاء SKU و Barcode متسلسلين
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    let currentCount = count || 0;
    const newItems = [];

    // 4. تجهيز القطع بعدد الكمية المطلوب إضافتها
    for (let i = 0; i < qtyNum; i++) {
      currentCount++;
      const sku = `DZB-${String(currentCount).padStart(3, '0')}`;
      const barcode = `613${String(currentCount).padStart(6, '0')}`;

      newItems.push({
        sku,
        barcode,
        name,
        shelf,
        position,
        image: image || '',
        product_id: product.id,
        status: 'available'
      });
    }

    // 5. حفظ جميع القطع دفعة واحدة في جدول inventory_items
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) return res.status(500).json({ success: false, error: itemsError });

    res.json({ success: true, items, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /items/:id - تحديث حالة القطعة وتحديث كمية المنتج في المتجر
router.put('/items/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // جلب الحالة القديمة ورقم المنتج المربوط
    const { data: old } = await supabase
      .from('inventory_items')
      .select('product_id,status')
      .eq('id', req.params.id)
      .single();

    // تحديث حالة القطعة
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error });

    // مزامنة المخزون في جدول المنتجات
    if (old?.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', old.product_id)
        .single();

      if (product) {
        if (status === 'sold' && old.status === 'available') {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, product.stock - 1) })
            .eq('id', old.product_id);
        } else if (status === 'available' && old.status === 'sold') {
          await supabase
            .from('products')
            .update({ stock: product.stock + 1 })
            .eq('id', old.product_id);
        }
      }
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;