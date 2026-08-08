# DZBoard Security Implementation Guide

## 🔐 ثغرات الأمان المغلقة

### 1. ✅ CSRF (Cross-Site Request Forgery) Protection
**المشكلة الأصلية:** لا توجد حماية من الهجمات الخارجية
**الحل المطبق:**
- إضافة middleware `csurf`
- توليد CSRF tokens في كل طلب حساس
- التحقق من الـ token في جميع POST/PUT/DELETE requests

```javascript
// الاستخدام في الواجهة الأمامية
const csrfToken = await getCsrfToken();
fetch('/api/products', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  credentials: 'include'
});
```

---

### 2. ✅ XSS (Cross-Site Scripting) Prevention
**المشكلة الأصلية:** بيانات المستخدم تُخزن بدون تنظيف
**الحل المطبق:**
- استخدام `validator.js` لتنظيف البيانات
- استخدام `escape()` لتحويل الأحرف الخاصة
- فصل البيانات عن الكود

```javascript
import validator from 'validator';

// تنظيف المدخلات
const cleanName = validator.escape(userInput);
// Output: &lt;script&gt; → آمن من التنفيذ
```

---

### 3. ✅ Authentication Security
**المشكلة الأصلية:** 
- Token مُخزن في localStorage (يمكن سرقته بـ XSS)
- كلمات مرور افتراضية ضعيفة
- عدم فرض متغيرات البيئة

**الحل المطبق:**
- استخدام **HttpOnly Cookies** (غير قابلة للوصول من JavaScript)
- **Secure flag** (تُرسل عبر HTTPS فقط)
- **SameSite=Strict** (حماية من CSRF)
- فرض متغيرات البيئة إلزامياً

```javascript
// الخادم
res.cookie('admin_token', token, {
  httpOnly: true,      // 🔒 JS لا يستطيع الوصول
  secure: true,        // 🔒 HTTPS فقط
  sameSite: 'strict',  // 🔒 حماية من CSRF
  maxAge: 24 * 60 * 60 * 1000
});
```

---

### 4. ✅ Input Validation & Sanitization
**المشكلة الأصلية:** عدم التحقق من صحة المدخلات
**الحل المطبق:**
- فحص نوع البيانات (type checking)
- حدود الحد الأدنى والأقصى
- التحقق من الصيغة (regex)
- تنظيف البيانات من XSS

```javascript
// مثال: التحقق من رقم الهاتف
if (!/^0[5-7]\d{8}$/.test(phone)) {
  return res.status(400).json({ success: false });
}

// مثال: التحقق من نوع السعر
if (typeof price !== 'number' || price < 0) {
  return res.status(400).json({ success: false });
}
```

---

### 5. ✅ Rate Limiting
**المشكلة الأصلية:** بدون حدود للطلبات (Brute Force)
**الحل المطبق:**
- حد عام: 100 طلب / 15 دقيقة
- حد صارم للدخول: 5 محاولات / 15 دقيقة
- تخطي الطلبات الناجحة

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 دقيقة
  max: 100,                   // 100 طلب
  skipSuccessfulRequests: true
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 محاولات فقط
  skipSuccessfulRequests: true
});
```

---

### 6. ✅ CORS Security
**المشكلة الأصلية:** `Access-Control-Allow-Origin: *` (يقبل من أي موقع)
**الحل المطبق:**
- تقييد الأصول لنطاق واحد فقط
- تقييد الطرق (GET, POST, PUT, DELETE)
- تقييد الرؤوس

```javascript
const corsOptions = {
  origin: 'https://dzboard.vercel.app',  // 🔒 نطاق واحد فقط
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
```

---

### 7. ✅ Order Tracking Security
**المشكلة الأصلية:** أي شخص يستطيع تتبع أي طلب بتخمين الرقم
**الحل المطبق:**
- التحقق من رقم الهاتف قبل الإفصاح عن البيانات
- التحقق من صيغة رقم التتبع

```javascript
export const trackOrder = async (req, res) => {
  const { tracking } = req.params;
  const { phone } = req.query;  // 🔒 يجب إدخال الهاتف
  
  // التحقق من صيغة الهاتف
  if (!/^0[5-7]\d{8}$/.test(phone)) {
    return res.status(400).json({ success: false });
  }
  
  // التحقق من تطابق الهاتف
  const order = Order.getByTracking(tracking);
  if (order.phone !== phone) {
    return res.status(403).json({ success: false });
  }
};
```

---

### 8. ✅ Admin Routes Protection
**المشكلة الأصلية:** مسارات الإدارة بدون حماية
**الحل المطبق:**
- التحقق من HttpOnly cookie
- Middleware للتحقق من الهوية
- مسار logout آمن

```javascript
// جميع المسارات الإدارية محمية
router.post('/sync', verifyAdmin, syncFunction);
router.post('/sync-communes', verifyAdmin, syncFunction);
```

---

### 9. ✅ Request Size Limits
**المشكلة الأصلية:** بدون حد للحجم (Buffer Overflow)
**الحل المطبق:**
- حد أقصى 10KB لـ JSON
- حد أقصى 10KB للـ URL-encoded data

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));
```

---

### 10. ✅ HTTP Security Headers
**المشكلة الأصلية:** بدون رؤوس أمان
**الحل المطبق:**
- Helmet.js لتعيين رؤوس الأمان
- Content Security Policy
- HSTS (HTTP Strict Transport Security)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));
```

---

## 📋 قائمة الفحص الأمني

```
✅ CSRF Protection
✅ XSS Prevention (Input/Output Encoding)
✅ Authentication Security (HttpOnly Cookies)
✅ Authorization Checks
✅ Input Validation
✅ Output Sanitization
✅ Rate Limiting
✅ CORS Security
✅ Error Handling (No sensitive info leak)
✅ Logging & Monitoring
✅ HTTPS Enforcement
✅ Security Headers
✅ SQL Injection Prevention (via Supabase ORM)
✅ API Security
✅ Secure Cookies
✅ Password Hashing (via environment)
✅ Session Management
✅ Request Size Limits
```

---

## 🚀 خطوات النشر على Vercel

### 1. إضافة متغيرات البيئة:
```bash
VERCEL_ENV_ADMIN_USERNAME=your_username
VERCEL_ENV_ADMIN_PASSWORD=your_strong_password
VERCEL_ENV_ADMIN_TOKEN=your_secure_token
VERCEL_ENV_COOKIE_SECRET=your_secret
VERCEL_ENV_FRONTEND_URL=https://dzboard.vercel.app
VERCEL_ENV_SUPABASE_URL=your_supabase_url
VERCEL_ENV_SUPABASE_ANON_KEY=your_key
VERCEL_ENV_ECOTRACK_API_TOKEN=your_token
```

### 2. التأكد من HTTPS:
- Vercel تفرض HTTPS افتراضياً ✅

### 3. اختبار الأمان:
```bash
# اختبر CSRF Protection
curl -X POST https://dzboard.vercel.app/api/admin/login \
  -H "X-CSRF-Token: invalid"
# يجب أن ترجع 403 Forbidden

# اختبر Rate Limiting
for i in {1..10}; do
  curl https://dzboard.vercel.app/api/admin/login
done
# بعد 5 محاولات، يجب أن يُرفض
```

---

## 📚 المراجع الأمنية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

## ⚠️ ملاحظات هامة

1. **تغيير كلمات المرور الافتراضية**
   - لا تستخدم القيم الموجودة في الأمثلة
   - استخدم كلمات مرور قوية (20+ حرف)

2. **حفظ الـ Secrets**
   - لا تضع متغيرات البيئة في Git
   - استخدم Vercel Secrets فقط

3. **تحديث المكتبات**
   - قم بتحديث المكتبات بانتظام
   - تابع تنبيهات الأمان

4. **المراقبة**
   - راقب السجلات بحثاً عن محاولات مريبة
   - أضف نظام تنبيهات

---

## 📞 الدعم

إذا واجهت مشاكل أمنية:
1. تحقق من SECURITY.md
2. راجع سجلات الخادم
3. اتصل بفريق الأمان
