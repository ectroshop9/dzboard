
# DZBoard - متجر قطع غيار الشاشات

## معلومات أساسية
- **الموقع**: https://dzboard-dz.vercel.app
- **بحث الصور**: https://dzboard-search-tau.vercel.app
- **الاستضافة**: Vercel Serverless
- **قاعدة البيانات**: Supabase (PostgreSQL)
- **الواجهة**: React + Vite
- **الخادم**: Node.js Express (Serverless)

## الجداول في Supabase
- `products` - المنتجات (name, price, stock, image, file_url, update_url, **phash, dhash**)
- `serials` - السيريالات (serial_code, max_downloads, used_downloads, is_active)
- `download_logs` - سجل التحميلات
- `cache` - الكاش (id, data, expires_at)
- `orders` - الطلبات
- `inventory_items` - عناصر المخزون (sku, barcode, product_id, status)
- `wilayas` / `communes` / `shipping_fees` - التوصيل

## الملفات المهمة
- `src/pages/StorePage.jsx` - صفحة المتجر + **زر البحث بالصورة 📸**
- `src/pages/DownloadPage.jsx` - صفحة التحميل بالسيريال
- `src/pages/AdminSerialsPage.jsx` - إدارة السيريالات
- `src/pages/AdminScanPage.jsx` - مسح الباركود + بيع مباشر
- `src/pages/AdminGiftCardPage.jsx` - بطاقة هدية للطباعة
- `src/pages/AdminProductFormPage.jsx` - إضافة/تعديل منتج
- `server/routes/serials.js` - API السيريالات + التحميل
- `server/routes/products.js` - API المنتجات + الكاش
- `server/routes/inventory.js` - API المخزون
- `server/controllers/productController.js` - **تلقائي البصمات**
- `src/components/ChatBot.jsx` - بوت المتجر

## 🔍 البحث بالصورة (dzboard-search)
- **المشروع**: مستودع منفصل `ectroshop9/dzboard-search`
- **التقنية**: Python FastAPI + Pillow + ImageHash
- **المسارات**:
  - `/` - صفحة هبوط 3D
  - `/uploadbytech` - صفحة التقني
  - `/health` - فحص UptimeRobot
  - `/search-by-image` - بحث بالصورة
  - `/generate-hashes` - توليد بصمات
  - `/reload-cache` - تحديث الذاكرة

## نظام الحماية
1. **السيريال**: إجباري للتحميل
2. **عدد محدود**: max_downloads لكل سيريال
3. **توكن مؤقت**: 5 دقائق + استخدام واحد
4. **Proxy Download**: يخفي رابط Drive الأصلي
5. **Rate Limiting**: 5 محاولات دخول ثم حظر 15 دقيقة
6. **reCAPTCHA**: v2 Invisible للدخول

## التوصيل
- **DHD/Ecotrack**: https://platform.dhd-dz.com/api/v1
- الولايات: 58 ولاية
- رسوم: domicile + stopdesk

## ميزات
- ✅ الكاش: 5 دقائق للمنتجات والمخزون
- ✅ ضغط الصور قبل رفع Cloudinary
- ✅ أداة تحويل رابط Google Drive
- ✅ بطاقات هدايا للطباعة
- ✅ شريط ترويجي ثابت
- ✅ **البحث بالصورة** - pHash + dHash (دقة 99%)
- ✅ **بصمات تلقائية** للمنتجات الجديدة
- ✅ **UptimeRobot** - السيرفر لا ينام

## ملاحظات مهمة
- التوكن في localStorage بصيغة JSON: {token, expires}
- البوت لا يظهر في صفحات /admin
- الملفات الكبيرة ستضاف لاحقاً مع Google Cloud Storage
- لا تسجيل دخول للزبائن - فقط سيريالات
- **البصمات**: 90 منتج محسوبة البصمات

## أوامر مفيدة
```bash
# رفع التغييرات
cd ~/dzboard
git add .
git commit -m "وصف التعديل"
git push origin main

# فحص الكاش
curl -w "Time: %{time_total}s\n" https://dzboard-dz.vercel.app/api/products

# فحص بحث الصور
curl https://dzboard-search-tau.vercel.app/health