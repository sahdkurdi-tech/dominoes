// ناوەکەمان گۆڕی بۆ v7 بۆ ئەوەی یەکسەر کاشە کۆنەکەی مۆبایلەکان بسڕێتەوە
const CACHE_NAME = 'domino-cache-v9.0';
const urlsToCache = [
    './',
    './index.html',
    './archive.html',
    './style.css?v=1.0',
    './mobile.css?v=1.0',
    './archive.css?v=1.0',
    './script.js?v=1.0',
    './archive.js?v=1.0',
    './firebase-init.js',
    './NRT-Reg.ttf',
    './sound1.mp3',
    './sound2.mp3',
    './sound3.mp3',
    './sound4.mp3',
    './sound5.mp3',
    './manifest.json',
    './icon-192.png', 
    './icon-512.png'  
];

self.addEventListener('install', event => {
    self.skipWaiting(); // یەکسەر ڤێرژنە نوێیەکە جێبەجێ دەکات
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // سڕینەوەی هەر کاشێک کە ناوی لەگەڵ ڤێرژنە نوێیەکە یەک ناگرێتەوە
                    if (cache !== CACHE_NAME) {
                        console.log('سڕینەوەی کاشی کۆن:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // یەکسەر کۆنتڕۆڵی پەڕەکە دەگرێتە دەست بەبێ پێویستی بە ڕیفرێشێکی زۆر
    return self.clients.claim(); 
});

// گۆڕانکارییە سەرەکییەکە لێرەدایە (Network First Strategy)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
        .then(networkResponse => {
            // ئەگەر ئینتەرنێت هەبوو و وەڵامەکە دروست بوو، کاشەکەش بۆ داهاتوو نوێ بکەرەوە
            if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
        })
        .catch(() => {
            // ئەگەر ئینتەرنێت نەبوو، ئەوا لە کاشە خەزنکراوەکەی مۆبایلەکەوە بیهێنە (بۆ ئەوەی ئۆفلاین کار بکات)
            return caches.match(event.request);
        })
    );
});