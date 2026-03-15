// گۆڕینی ڤێرژن بۆ v2
const CACHE_NAME = 'domino-cache-v3';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './mobile.css',
    './script.js',
    './NRT-Reg.ttf',
    './sound1.mp3',
    './sound2.mp3',
    './sound3.mp3',
    './sound4.mp3',
    './sound5.mp3',
    './manifest.json'
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