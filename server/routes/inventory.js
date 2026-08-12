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

    // جلب المنتجات المربوطة
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

// POST /items - إضافة قطعة أو أكثر ومزامنة الكمية مع جدول المنتجات
router.post('/items', verifyAdmin, async (req, res) => {
  try {
    const { name, shelf, position, price, image, category, brand, quantity } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'اسم القطعة مطلوب' });
    }

    // تنظيف وحساب الأرقام لمنع خطأ integer: ""
    const qtyNum = parseInt(quantity, 10) > 0 ? parseInt(quantity, 10) : 1;
    const parsedPrice = (price !== "" && price !== null && !isNaN(price)) ? parseFloat(price) : 0;

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
      console.error('Product Insert Error:', productError);
      return res.status(500).json({ success: false, error: productError.message });
    }

    // 2. جلب العدد الحالي للقطع لإنشاء SKU و Barcode
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    let currentCount = count || 0;
    const newItems = [];
    const timestamp = Date.now().toString().slice(-4);

    // 3. تجهيز القطع مع ضمان معالجة المعرفات
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
        product_id: parseInt(product.id, 10), // التأكد من تحويل المعرف لرقم صحيح
        status: 'available'
      });
    }

    // 4. حفظ القطع
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) {
      console.error('Inventory Insert Error:', itemsError);
      return res.status(500).json({ success: false, error: itemsError.message });
    }

    res.json({ success: true, items, product });
  } catch (err) {
    console.error('POST /items Exception:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /items/:id - تحديث حالة القطعة
router.put('/items/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId)) {
      return res.status(400).json({ success: false, message: 'معرف القطعة غير صالح' });
    }

    const { data: old } = await supabase
      .from('inventory_items')
      .select('product_id, status')
      .eq('id', itemId)
      .single();

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', itemId)
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