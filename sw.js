const CACHE = 'jkb-v6';

// 이미지·폰트처럼 거의 안 바뀌는 파일 → 캐시 우선
const STATIC_ASSETS = [
  '/images/character-nobg.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

// JS·CSS·HTML → 네트워크 우선 (오프라인 때만 캐시 폴백)
const DYNAMIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/auth.js',
  '/js/toss-sdk-bundle.iife.js',
  '/js/map.js',
  '/js/search.js',
  '/js/ui.js',
  '/js/app.js',
];

const ALL_PRECACHE = [...STATIC_ASSETS, ...DYNAMIC_ASSETS];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ALL_PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 외부 요청(카카오 API 등)은 캐시 없이 네트워크 직접
  if (!url.startsWith(self.location.origin)) return;

  const path = new URL(url).pathname;

  // 정적 에셋: 캐시 우선
  if (STATIC_ASSETS.some(p => path === p || path.startsWith(p))) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // JS·CSS·HTML: 네트워크 우선 → 실패 시 캐시 폴백
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(cached => cached || caches.match('/index.html'))
      )
  );
});
