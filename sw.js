// Service worker MainDeDieu : fonctionne hors ligne. Incrémenter VERSION à chaque publication.
const VERSION = 'mdd-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css', 'css/tokens.css',
  'js/data.js', 'js/game.js', 'js/planet.js', 'js/app.js', 'vendor/planet3d.js', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
