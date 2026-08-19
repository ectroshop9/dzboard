import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// ✅ النسخ الاحتياطي التلقائي اليومي - أضفته فقط
const autoBackup = async () => {
  try {
    console.log('🔄 Auto backup started...');
    
    const [productsResult, itemsResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory_items').select('*')
    ]);

    const backupData = {
      version: '1.0',
      type: 'auto_daily',
      created_at: new Date().toISOString(),
      tables: {
        products: productsResult.data || [],
        inventory_items: itemsResult.data || []
      }
    };

    // حفظ في جدول backups
    const { error } = await supabase
      .from('backups')
      .insert({ 
        type: 'auto_daily',
        products_data: backupData.tables.products,
        items_data: backupData.tables.inventory_items
      });

    if (error) {
      console.error('Auto backup save error:', error.message);
    } else {
      console.log('✅ Auto backup saved successfully at', new Date().toISOString());
    }

    // حذف النسخ القديمة (الاحتفاظ بآخر 7 أيام فقط)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('backups').delete().lt('created_at', sevenDaysAgo).eq('type', 'auto_daily');

  } catch (err) {
    console.error('Auto backup error:', err.message);
  }
};

// ✅ تشغيل النسخ التلقائي كل 24 ساعة
setInterval(autoBackup, 24 * 60 * 60 * 1000);

// ✅ نسخة أولى عند تشغيل الخادم (بعد 30 ثانية)
setTimeout(autoBackup, 30000);

// ✅ جلب النسخ الاحتياطية التلقائية
router.get('/auto', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('backups')
      .select('id, type, created_at')
      .order('id', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    res.json({ success: true, backups: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ استرجاع نسخة تلقائية محددة
router.post('/auto/:id/restore', async (req, res) => {
  try {
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !backup) {
      return res.status(404).json({ success: false, error: 'النسخة غير موجودة' });
    }

    if (backup.products_data && backup.products_data.length > 0) {
      await supabase.from('products').delete().neq('id', 0);
      
      for (const product of backup.products_data) {
        const { id, created_at, updated_at, ...productData } = product;
        await supabase.from('products').insert(productData);
      }
    }

    res.json({ success: true, message: 'تم استرجاع النسخة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /backup - إنشاء نسخة احتياطية وتنزيلها (الموجود)
router.get('/', async (req, res) => {
  try {
    console.log('Creating backup...');
    
    const [productsResult, itemsResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory_items').select('*')
    ]);

    if (productsResult.error) throw productsResult.error;
    if (itemsResult.error) throw itemsResult.error;

    let ordersData = [];
    let requestsData = [];
    
    try {
      const ordersResult = await supabase.from('orders').select('*');
      if (!ordersResult.error) ordersData = ordersResult.data || [];
    } catch (e) {
      console.log('Orders table not found');
    }
    
    try {
      const requestsResult = await supabase.from('special_requests').select('*');
      if (!requestsResult.error) requestsData = requestsResult.data || [];
    } catch (e) {
      console.log('Special requests table not found');
    }

    const backupData = {
      version: '1.0',
      created_at: new Date().toISOString(),
      tables: {
        products: productsResult.data || [],
        inventory_items: itemsResult.data || [],
        orders: ordersData,
        special_requests: requestsData
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(backupData, null, 2));

  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /backup/restore - استرجاع البيانات (الموجود)
router.post('/restore', async (req, res) => {
  // ... نفس الكود الموجود بدون تغيير
});

export default router;