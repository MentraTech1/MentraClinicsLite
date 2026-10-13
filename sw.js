// ==========================================
// MentraClinics Lite - Service Worker (Offline First)
// ==========================================

// تم تغيير رقم الإصدار لإجبار المتصفح على تحديث الكاش القديم
const CACHE_NAME = 'mentra-clinics-v1.2';

// الملفات الأساسية التي يجب تحميلها فور تشغيل البرنامج لأول مرة
const CORE_ASSETS = [
    './',
    './index.html',
    './subscriptions.html',
    './dashboard.html',
    './Tutorial.html',
    './database.js',
    './manifest.json',
    './assets/logo.png',
    './assets/step.PNG',
    './assets/step1.PNG',
    './assets/step2.PNG',
    './assets/step3.PNG',
    './assets/step4.PNG',
    './assets/step5.PNG',
    './assets/step6.PNG',
    './assets/step7.PNG',
    './assets/step8.PNG',
    
    // شاشات النظام المبرمجة ديناميكياً
    './pages/main.js',
    './pages/appointments.js',
    './pages/patients.js',
    './pages/visits.js',
    './pages/catalog.js',
    './pages/accounting.js',
    './pages/settings.js',
    './pages/backup.js'
];

// الروابط الخارجية (CDNs)
const CDN_URLS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com',
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net' // تمت إضافتها لدعم Chart.js التي أضفناها مؤخراً
];

// 1. حدث التثبيت (Install) - حفظ الملفات الأساسية
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 [Service Worker] Caching Core Assets...');
            return Promise.allSettled(
                CORE_ASSETS.map(url => 
                    cache.add(url).catch(err => console.warn(`⚠️ لم يتم العثور على: ${url}`))
                )
            );
        })
    );
});

// 2. حدث التفعيل (Activate) - مسح الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ [Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. حدث جلب البيانات (Fetch) - المنطق الذكي والمحمي
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // [حماية احترافية]: تجاهل طلبات POST، PUT، وإضافات المتصفح (Chrome Extensions)
    if (event.request.method !== 'GET' || requestUrl.startsWith('chrome-extension://')) {
        return;
    }

    // أ) إذا كان الطلب من مكتبة خارجية (CDN) - استراتيجية: Cache First
    if (CDN_URLS.some(cdn => requestUrl.includes(cdn))) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse; 
                
                return fetch(event.request).then((networkResponse) => {
                    // التحقق من صحة الرد (status 0 للـ CDNs بدون CORS، و 200 للروابط العادية)
                    if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
                        return networkResponse;
                    }

                    // أخذ نسخة آمنة لتفادي خطأ (Body already used)
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    console.warn('❌ [Service Worker] Network failed for CDN:', requestUrl);
                });
            })
        );
        return;
    }

    // ب) إذا كان الطلب لملفات النظام المحلية - استراتيجية: Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // تحديث الكاش فقط إذا كان الملف الجديد سليماً 100% (لتجنب تخزين صفحة خطأ 404)
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                console.log('📡 [Service Worker] Offline mode, serving:', requestUrl);
            });

            // إرجاع الكاش فوراً إن وجد لتسريع الصفحة، بينما يتم التحديث في الخلفية
            return cachedResponse || fetchPromise;
        })
    );
});