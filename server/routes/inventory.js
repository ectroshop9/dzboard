import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /items - جلب القطع وإضافة تفاصيل المنتج المربوط بها
router.get('/items', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('inventory_items').select('*').order('id', { ascending: false });
    
    if (search) {
      query = query.or(`sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    
    const { data: items, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    // دمج تفاصيل المنتج مع كل قطعة مخزون
    for (let item of (items || [])) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('name, image, price')
          .eq('id', item.product_id)
          .single();
          
        if (product) {
          item.name = product.name;
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
    const { name, shelf, position, price, image, category, brand, quantity = 1 } = req.body;
    const qtyNum = Math.max(1, parseInt(quantity, 10) || 1);

    // 1. إنشاء المنتج في جدول products
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        price: parseFloat(price) || 0,
        stock: qtyNum,
        active: true,
        category: category || 'parts',
        brand: brand || 'generic',
        image: image || '',
        description: shelf ? `${shelf} - ${position || ''}` : ''
      })
      .select()
      .single();

    if (productError) {
      console.error('Product Error:', productError);
      return res.status(500).json({ success: false, error: productError.message });
    }

    // 2. جلب العدد الحالي للقطع لإنشاء SKU و Barcode
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    let currentCount = count || 0;
    const newItems = [];

    // 3. تجهيز القطع (تم إزالة حقل name لتجنب خطأ قاعدة البيانات)
    for (let i = 0; i < qtyNum; i++) {
      currentCount++;
      const sku = `DZB-${String(currentCount).padStart(3, '0')}`;
      const barcode = `613${String(currentCount).padStart(6, '0')}`;

      newItems.push({
        sku,
        barcode,
        shelf: shelf || '',
        position: position || '',
        image: image || '',
        product_id: product.id,
        status: 'available'
      });
    }

    // 4. حفظ القطع دفعة واحدة
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) {
      console.error('Inventory Error:', itemsError);
      return res.status(500).json({ success: false, error: itemsError.message });
    }

    res.json({ success: true, items, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /items/:id - تحديث حالة القطعة وتحديث كمية المنتج في المتجر
router.put('/items/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const { data: old } = await supabase
      .from('inventory_items')
      .select('product_id,status')
      .eq('id', req.params.id)
      .single();

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

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