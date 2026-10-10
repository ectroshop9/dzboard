# 🛒 DZBoard - متجر قطع غيار الشاشات

متجر إلكتروني متكامل لبيع قطع غيار الشاشات والتلفزيونات مع لوحة تحكم كاملة.

## 🌐 الروابط

| الرابط | الوصف |
|--------|-------|
| [المتجر](https://dzboard-dz.vercel.app) | واجهة العملاء |
| [بحث الصور](https://dzboard-search-tau.vercel.app) | البحث بالصور |
| [الإدارة](https://dzboard-dz.vercel.app/admin) | لوحة التحكم |
| [صفحة التقني](https://dzboard-search-tau.vercel.app/uploadbytech) | للتقنيين |

## ✨ الميزات

- 🛍️ **متجر كامل** - 98 منتج
- 📸 **بحث بالصورة** - pHash + dHash (دقة 99%)
- 🚚 **DHD API** - توصيل لكل الولايات
- 📍 **55 ولاية + 1548 بلدية**
- 🏢 **89 مكتب توصيل**
- 🔔 **إشعارات فورية** - Webpushr
- 👨‍🔧 **خريطة المصلحين** - تفاعلية
- 📱 **زر Viber** مباشر
- 🔐 **أمان متكامل** - RLS + Cookies

## 🛠️ التقنيات

**Frontend:**
- React 19 + Vite 7
- React Router 7
- Lucide Icons
- Leaflet (خرائط)
- XLSX (تصدير Excel)

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL)
- Cloudinary (صور)
- DHD/Ecotrack (شحن)
- Webpushr (إشعارات)

## 🔐 الأمان

- ✅ RLS مفعّل على كل الجداول
- ✅ HttpOnly Cookies
- ✅ Timing-safe verifyAdmin
- ✅ Rate Limiting (3 مستويات)
- ✅ CORS صحيح
- ✅ Security Headers (Helmet)
- ✅ BOT_KEY للبوت

## 📊 قاعدة البيانات

| الجدول | الوصف |
|--------|-------|
| `products` | المنتجات + بصمات الصور |
| `orders` | الطلبات |
| `stopdesks` | مكاتب التوصيل |
| `companies` | شركات التوصيل |
| `technicians` | المصلحين |
| `notifications` | سجل الإشعارات |
| `serials` | السيريالات |
| `wilayas` + `communes` | التوصيل |

## 🚀 التشغيل المحلي

```bash
# تثبيت
npm install

# تشغيل التطوير
npm run dev

# بناء للإنتاج
npm run build
📦 النشر
Frontend + Backend: Vercel

بحث الصور: Vercel (Python)

قاعدة البيانات: Supabase

📝 المتغيرات البيئية
ADMIN_USERNAME=xxx
ADMIN_PASSWORD=xxx
ADMIN_TOKEN=xxx
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
ECOTRACK_API_URL=xxx
ECOTRACK_API_TOKEN=xxx
WEBPUSHR_API_KEY=xxx
WEBPUSHR_AUTH_TOKEN=xxx
BOT_KEY=xxx
📅 الإصدار
DZBoard 2026 - Production Ready ✅

© 2026 DZBoard - جميع الحقوق محفوظة
