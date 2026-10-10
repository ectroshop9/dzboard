// ✅ Service Worker - آمن ومحسّن
const CACHE_NAME = 'dzboard-v1';

// تثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// تنشيط
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// اعتراض الطلبات - فقط للصفحات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ تجاهل API (لا تعترض)
  if (url.pathname.startsWith('/api/')) {
    return; // دع المتصفح يتعامل معها بشكل طبيعي
  }

  // ✅ تجاهل النطاقات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // ✅ تجاهل غير GET
  if (request.method !== 'GET') {
    return;
  }

  // ✅ للمواقع الأخرى - Network first مع fallback آمن
  event.respondWith(
    fetch(request)
      .catch(() => {
        // إذا فشل، حاول من الكاش
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // إذا لم يوجد، أرجع الصفحة الرئيسية
          return caches.match('/').then(home => {
            return home || new Response('Offline', { status: 503 });
          });
        });
      })
  );
});
