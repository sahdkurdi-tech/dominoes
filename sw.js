// گۆڕینی ڤێرژن بۆ v6 بۆ ئەوەی هەموو فایلە نوێیەکان و ئەرشیفەکە بخوێنێتەوە
const CACHE_NAME = 'domino-cache-v6';
const urlsToCache = [
    './',
    './index.html',
    './archive.html',         // پەڕەی ئەرشیف زیاد کرا
    './style.css?v=1.0',      // ڤێرژنی نوێی دیزاین
    './mobile.css?v=1.0',     // ڤێرژنی نوێی مۆبایل
    './archive.css?v=1.0',    // دیزاینی ئەرشیف زیاد کرا
    './script.js?v=1.0',      // ڤێرژنی نوێی جاڤاسکریپتی سەرەکی
    './archive.js?v=1.0',     // جاڤاسکریپتی ئەرشیف زیاد کرا
    './firebase-init.js',     // فایلی بەستنەوەی فایربەیس زیاد کرا
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
    self.skipWaiting(); // ئەمە فۆرسی دەکات یەکسەر ڤێرژنە نوێیەکە جێبەجێ ببێت
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
                    if (cache !== CACHE_NAME) {
                        console.log('سڕینەوەی کاشی کۆن:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});