import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

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

    // جلب المنتجات المربوطة دفعة واحدة لتقليل الضغط
    const productIds = [...new Set((items || []).map(i => i.product_id).filter(Boolean))];
    let productsMap = {};

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image, price')
        .in('id', productIds);

      if (products) {
        productsMap = products.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
    }

    // دمج التفاصيل
    const formattedItems = (items || []).map(item => {
      const product = productsMap[item.product_id];
      return {
        ...item,
        name: product?.name || 'قطعة بدون اسم',
        image: item.image || product?.image || '',
        price: product?.price || 0
      };
    });

    res.json({ success: true, items: formattedItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /items - إضافة قطعة أو أكثر (محمي للآدمن)
router.post('/items', verifyAdmin, async (req, res) => {
  try {
    const { name, shelf, position, price, image, category, brand, quantity = 1 } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'اسم القطعة مطلوب' });
    }

    const qtyNum = Math.max(1, parseInt(quantity, 10) || 1);
    const parsedPrice = parseFloat(price) || 0;

    // 1. إنشاء المنتج في جدول products
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        price: parsedPrice,
        stock: qtyNum,
        active: true,
        category: category || 'parts',
        brand: brand || 'generic',
        image: image || '',
        description: shelf ? `الرف: ${shelf} - الموضع: ${position || ''}` : ''
      })
      .select()
      .single();

    if (productError) {
      console.error('Product Error:', productError);
      return res.status(500).json({ success: false, error: `خطأ في إنشاء المنتج: ${productError.message}` });
    }

    // 2. جلب العدد الحالي للقطع لتوليد الـ SKU
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    let currentCount = count || 0;
    const newItems = [];
    const timestamp = Date.now().toString().slice(-4);

    // 3. تجهيز القطع مع ضمان أن كل قطعة تمتلك SKU و Barcode فريدين
    for (let i = 0; i < qtyNum; i++) {
      currentCount++;
      const uniqueSeq = String(currentCount).padStart(4, '0');
      const sku = `DZB-${uniqueSeq}`;
      const barcode = `613${timestamp}${String(i).padStart(3, '0')}`;

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

    // 4. حفظ القطع
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) {
      console.error('Inventory Error:', itemsError);
      return res.status(500).json({ success: false, error: `خطأ في إنشاء عناصر المخزون: ${itemsError.message}` });
    }

    res.json({ success: true, items, product });
  } catch (err) {
    console.error('Unhandled POST /items error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /items/:id - تحديث حالة القطعة (محمي للآدمن)
router.put('/items/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'الحالة مطلوبة' });
    }

    const { data: old } = await supabase
      .from('inventory_items')
      .select('product_id, status')
      .eq('id', req.params.id)
      .single();

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    // تحديث مخزون جدول المنتجات
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