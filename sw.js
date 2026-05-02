// ============================================================
//  KikTop Fresco — Service Worker (PWA + Offline)
//  Version 1.0
// ============================================================

const CACHE_NAME   = 'kiktop-v1';
const OFFLINE_URL  = '/offline.html';

// Fichye pou cache statik (shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/sw.js',
  // Google Fonts fallback — pral cache apre premye vizyit
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Dancing+Script:wght@700&display=swap',
];

// ── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache silencye — ignorer erè pou URL ekstèn
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ───────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore Supabase API calls — toujou network
  if (url.hostname.includes('supabase.co')) return;

  // Ignore POST / PUT / DELETE — toujou network
  if (request.method !== 'GET') return;

  // Stratèji: Network First pou HTML, Cache First pou assets
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// Network First: eseye rezo, sinon cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/index.html');
  }
}

// Cache First: chèche nan cache, sinon rezo
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

// ── PUSH NOTIFICATIONS (pou pita) ───────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'KikTop Fresco', {
      body   : data.body || 'Yon nouvo mesaj pou ou!',
      icon   : '/icons/icon-192.png',
      badge  : '/icons/badge-72.png',
      data   : { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'Wè' },
        { action: 'dismiss', title: 'Fèmen' },
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(wins => {
      const win = wins.find(w => w.url === url && 'focus' in w);
      return win ? win.focus() : clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC (kòmand offline) ────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  // Rekipere kòmand ki te fèt offline
  const cache  = await caches.open('kiktop-pending');
  const keys   = await cache.keys();
  for (const req of keys) {
    try {
      const stored  = await cache.match(req);
      const payload = await stored.json();
      const res = await fetch('/api/orders', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });
      if (res.ok) await cache.delete(req);
    } catch { /* Reyeseye pita */ }
  }
}
