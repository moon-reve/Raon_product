const CACHE = 'raon-v7';
const STATIC = ['/logo.png', '/logo_square.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 이전 버전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML, CSS, JS 는 항상 네트워크 우선
  if (
    e.request.destination === 'document' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // 이미지 등 정적 파일은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
