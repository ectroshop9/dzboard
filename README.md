# DZBoard - متجر قطع غيار الشاشات

## معلومات أساسية
- **الموقع**: https://dzboard-dz.vercel.app
- **بحث الصور**: https://dzboard-search-tau.vercel.app
- **الاستضافة**: Vercel Serverless
- **قاعدة البيانات**: Supabase (PostgreSQL)
- **الواجهة**: React + Vite
- **الخادم**: Node.js Express (Serverless)
- **الإصدار المستقر**: tag `dzboard2027`

## الجداول في Supabase (19 جدول)
- `products` - المنتجات (name, price, stock, image, file_url, update_url, **phash, dhash, shelf_code**)
- `orders` - الطلبات (customer, phone, wilaya_id, commune, address, shipping_type, items, amount, shipping, status, tracking, **ecotrack_response**)
- `stopdesks` - مكاتب التوصيل (wilaya_id, name, commune, address, phone, **company, company_id**, active)
- `companies` - شركات التوصيل (name, active)
- `technicians` - المصلحين (name, phone, wilaya_id, commune, address, notes, active)
- `serials` - السيريالات (serial_code, max_downloads, used_downloads, is_active)
- `download_logs` - سجل التحميلات
- `cache` - الكاش (id, data, expires_at)
- `inventory_items` - عناصر المخزون (sku, barcode, product_id, shelf_id, position, status)
- `inventory_movements` - حركات المخزون
- `shelves` - الرفوف (name, code, description)
- `wilayas` / `communes` / `shipping_fees` - التوصيل
- `bot_orders` - طلبات البوت
- `special_requests` - طلبات خاصة
- `chat_logs` - سجل المحادثة
- `live_chats` - محادثة مباشرة
- `backups` - النسخ الاحتياطي
- `tv_stock` - مخزون التلفزيونات المكسورة

## الملفات المهمة
### صفحات الزبائن
- `src/pages/StorePage.jsx` - صفحة المتجر + **زر البحث بالصورة 📸**
- `src/pages/CheckoutPage.jsx` - صفحة الشراء
- `src/pages/ThankYouPage.jsx` - صفحة الشكر + **عرض مكتب الولاية**
- `src/pages/DownloadPage.jsx` - صفحة التحميل بالسيريال
- `src/pages/ProductDetailPage.jsx` - تفاصيل المنتج
- `src/pages/RequestPartPage.jsx` - طلب قطعة خاصة
- `src/pages/TechniciansMapPage.jsx` - خريطة المصلحين

### صفحات الأدمن
- `src/pages/AdminProductsPage.jsx` - إدارة المنتجات
- `src/pages/AdminProductFormPage.jsx` - إضافة/تعديل منتج
- `src/pages/AdminOrdersPage.jsx` - إدارة الطلبات
- `src/pages/AdminBotOrdersPage.jsx` - طلبات البوت
- `src/pages/AdminSerialsPage.jsx` - إدارة السيريالات
- `src/pages/AdminScanPage.jsx` - مسح الباركود + بيع مباشر
- `src/pages/AdminGiftCardPage.jsx` - بطاقة هدية للطباعة
- `src/pages/AdminTechniciansPage.jsx` - إدارة المصلحين
- `src/pages/AdminStopdesksPage.jsx` - إدارة مكاتب التوصيل
- `src/pages/AdminCompaniesPage.jsx` - إدارة شركات التوصيل
- `src/pages/AdminTVStockPage.jsx` - مخزون الشاشات المكسورة
- `src/pages/AdminSettingsPage.jsx` - الإعدادات + روابط سريعة

### APIs
- `server/routes/products.js` - API المنتجات + الكاش
- `server/routes/orders.js` - API الطلبات + DHD
- `server/routes/stopdesks.js` - API مكاتب التوصيل
- `server/routes/companies.js` - API شركات التوصيل
- `server/routes/technicians.js` - API المصلحين
- `server/routes/shipping.js` - API التوصيل
- `server/routes/serials.js` - API السيريالات + التحميل
- `server/routes/inventory.js` - API المخزون
- `server/routes/backup.js` - النسخ الاحتياطي

### الخدمات
- `server/services/ecotrack.js` - **DHD** + Fallback تلقائي
- `server/controllers/productController.js` - **تلقائي البصمات**
- `server/controllers/orderController.js` - إنشاء الطلبات

## 🔍 البحث بالصورة (dzboard-search)
- **المشروع**: مستودع منفصل `ectroshop9/dzboard-search`
- **التقنية**: Python FastAPI + Pillow + ImageHash
- **الرابط**: https://dzboard-search-tau.vercel.app
- **المسارات**:
  - `/` - صفحة هبوط 3D (تلفاز + نجوم متحركة)
  - `/uploadbytech` - صفحة التقني البسيطة
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
7. **verifyAdmin**: تحقق من التوكن

## التوصيل (DHD API)
- **DHD/Ecotrack**: https://platform.dhd-dz.com/api/v1
- **55 ولاية** مدعومة (بدون 50, 54, 56)
- **Fallback تلقائي**: إذا رفض DHD stopdesk → يُرسل كـ domicile
- **مكاتب التوصيل**: 89 مكتب في قاعدة البيانات
- **عرض المكتب**: حسب **الولاية** في صفحة الشكر

## ميزات
- ✅ الكاش: 5 دقائق للمنتجات والمخزون
- ✅ ضغط الصور قبل رفع Cloudinary
- ✅ أداة تحويل رابط Google Drive
- ✅ بطاقات هدايا للطباعة
- ✅ شريط ترويجي ثابت
- ✅ **البحث بالصورة** - pHash + dHash (دقة 99%)
- ✅ **بصمات تلقائية** للمنتجات الجديدة
- ✅ **UptimeRobot** - السيرفر لا ينام
- ✅ **DHD Fallback** - الطلبات تنجح دائماً
- ✅ **مكتب حسب الولاية** - يظهر في صفحة الشكر
- ✅ **شركات متعددة** - جاهز لـ Yalidine, Maystro
- ✅ **خريطة الجزائر** - خريطة جغرافية للمصلحين
- ✅ **Webpushr** - إشعارات المتصفح
- ✅ **نظام رفوف** - shelf_code في المنتجات

## ملاحظات مهمة
- التوكن في localStorage بصيغة JSON: {token, expires}
- البوت لا يظهر في صفحات /admin
- لا تسجيل دخول للزبائن - فقط سيريالات
- **البصمات**: 90 منتج محسوبة
- **DHD**: `ecotrack_response` يحفظ كل response من DHD للأخطاء
- **الولايات DHD**: 55 (بدون 50, 54, 56)

## أوامر مفيدة
```bash
# رفع التغييرات
cd ~/dzboard
git add .
git commit -m "وصف التعديل"
git push origin main

# الرجوع للنسخة المستقرة
git reset --hard dzboard2027
git push origin main --force

# فحص الصحة
curl https://dzboard-dz.vercel.app/api/products
curl https://dzboard-search-tau.vercel.app/health

# فحص الكاش
curl -w "Time: %{time_total}s\n" https://dzboard-dz.vercel.app/api/products

# فحص المكاتب
curl "https://dzboard-dz.vercel.app/api/stopdesks?wilaya_id=48"
Tags
dzboard2027 - آخر نسخة مستقرة

روابط سريعة
المتجر

بحث الصور

صفحة التقني

لوحة التحكم

الإعدادات
