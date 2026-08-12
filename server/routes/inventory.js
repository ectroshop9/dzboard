import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /items - جلب القطع وإضافة تفاصيل المنتج المربوط بها
router.get('/items', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('id', { ascending: false });
    
    if (search) {
      query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

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
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /items - إضافة قطعة أو أكثر ومزامنة الكمية مع جدول المنتجات
router.post('/items', async (req, res) => {
  try {
    const { name, price, quantity, category, brand, image } = req.body;
    
    // تنظيف البيانات
    const cleanName = String(name || '').trim();
    const cleanPrice = Number(price) || 0;
    const cleanQuantity = Math.max(1, Number(quantity) || 1);
    
    if (!cleanName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name is required' 
      });
    }

    // إنشاء المنتج في جدول products
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: cleanName,
        price: cleanPrice,
        stock: cleanQuantity,
        active: true,
        category: category || 'parts',
        brand: brand || 'generic',
        image: image || '',
        description: ''
      })
      .select()
      .single();

    if (productError) {
      console.error('Product error:', productError);
      return res.status(500).json({ 
        success: false, 
        error: productError.message 
      });
    }

    // جلب العدد الحالي للقطع لإنشاء SKU و Barcode متسلسلين
    const { count, error: countError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({ 
        success: false, 
        error: countError.message 
      });
    }

    let currentCount = count || 0;
    const newItems = [];

    // تجهيز القطع بعدد الكمية المطلوب إضافتها
    for (let i = 0; i < cleanQuantity; i++) {
      currentCount++;
      const sku = `DZB-${String(currentCount).padStart(3, '0')}`;
      const barcode = `613${String(currentCount).padStart(6, '0')}`;

      newItems.push({
        sku,
        barcode,
        name: cleanName,
        product_id: product.id,
        status: 'available',
        notes: '',
        image: image || ''
      });
    }

    // حفظ جميع القطع دفعة واحدة
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) {
      console.error('Items error:', itemsError);
      return res.status(500).json({ 
        success: false, 
        error: itemsError.message 
      });
    }

    res.json({ 
      success: true, 
      items, 
      product 
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// PUT /items/:id - تحديث حالة القطعة وتحديث كمية المنتج في المتجر
router.put('/items/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const itemId = parseInt(req.params.id, 10);
    
    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid item ID' 
      });
    }
    
    // جلب الحالة القديمة ورقم المنتج المربوط
    const { data: old, error: oldError } = await supabase
      .from('inventory_items')
      .select('product_id,status')
      .eq('id', itemId)
      .single();

    if (oldError) {
      console.error('Old item error:', oldError);
      return res.status(500).json({ 
        success: false, 
        error: oldError.message 
      });
    }

    // تحديث حالة القطعة
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    // مزامنة المخزون في جدول المنتجات
    if (old?.product_id) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', old.product_id)
        .single();

      if (!productError && product) {
        if (status === 'sold' && old.status === 'available') {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, (product.stock || 0) - 1) })
            .eq('id', old.product_id);
        } else if (status === 'available' && old.status === 'sold') {
          await supabase
            .from('products')
            .update({ stock: (product.stock || 0) + 1 })
            .eq('id', old.product_id);
        }
      }
    }

    res.json({ success: true, item });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;