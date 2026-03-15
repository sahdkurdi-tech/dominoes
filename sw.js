const CACHE_NAME = 'domino-cache-v1';
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
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});