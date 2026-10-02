const CACHE = 'geolearn-v5';
const TILE_CACHE = 'geolearn-tiles-v1';
const TILE_CACHE_MAX = 400; // ~ a few viewed regions; trimmed oldest-first
const CORE = ['/', '/index.html', '/manifest.json', '/icon.svg'];

// Cross-origin assets we cache for offline play. Requests from <img> are
// no-cors (opaque, status 0), which previously meant `res.ok` was never true
// and nothing cross-origin was ever cached. These hosts all send CORS headers,
// so we re-issue the request in cors mode to get a cacheable response.
const ASSET_HOSTS = ['flagcdn.com', 'upload.wikimedia.org', 'raw.githubusercontent.com'];
const TILE_HOSTS = ['basemaps.cartocdn.com', 'server.arcgisonline.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== TILE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function fetchCacheable(req) {
  // Try a CORS request first so the response is inspectable and cheap to store;
  // fall back to the original (possibly opaque) request if the host refuses.
  try {
    const res = await fetch(new Request(req.url, { mode: 'cors', credentials: 'omit' }));
    if (res.ok) return res;
  } catch {}
  return fetch(req);
}

async function trimCache(name, max) {
  const c = await caches.open(name);
  const keys = await c.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k)));
}

function cacheFirst(event, cacheName, { trim } = {}) {
  event.respondWith(
    caches.open(cacheName).then(async (c) => {
      const cached = await c.match(event.request);
      if (cached) return cached;
      try {
        const res = await fetchCacheable(event.request);
        if (res.ok || res.type === 'opaque') {
          c.put(event.request, res.clone());
          if (trim) event.waitUntil(trimCache(cacheName, trim));
        }
        return res;
      } catch {
        return Response.error();
      }
    })
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const host = url.hostname;

  // Data JSON, flags, boundary GeoJSON: cache-first (offline play after first load)
  const isDataFile = url.origin === self.location.origin && url.pathname.startsWith('/data/');
  if (isDataFile || ASSET_HOSTS.some((h) => host.endsWith(h))) {
    cacheFirst(event, CACHE);
    return;
  }

  // Base-map tiles: cache-first in a separate, size-capped cache so the
  // regions a player has already viewed keep rendering offline.
  if (TILE_HOSTS.some((h) => host.endsWith(h))) {
    cacheFirst(event, TILE_CACHE, { trim: TILE_CACHE_MAX });
    return;
  }

  // Navigations: network-first, fallback to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Same-origin static: network-first so code fixes reach users immediately,
  // falling back to cache when offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (c) => {
        try {
          const res = await fetch(req);
          if (res.ok) c.put(req, res.clone());
          return res;
        } catch {
          const cached = await c.match(req);
          return cached || Response.error();
        }
      })
    );
  }
});
