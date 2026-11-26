/* TeliPally service worker — offline shell + smart caching */
const VERSION = "telipally-v1.0.2";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, timeoutMs, cacheNames) {
  const cache = await caches.open(cacheNames);
  try {
    const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs));
    const response = await Promise.race([fetch(request), timer]);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request)
      .then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
      })
      .catch(() => undefined);
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never intercept cross-origin traffic (HLS streams, channel logos, etc.)
  if (url.origin !== self.location.origin) return;

  // App shell navigations: network first, fall back to cached shell
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, 8000, RUNTIME_CACHE).catch(async () => {
        const shell = await caches.open(SHELL_CACHE);
        return (await shell.match("/")) || Response.error();
      }),
    );
    return;
  }

  // API: network first with cache fallback so the last seen data works offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      networkFirst(request, 8000, RUNTIME_CACHE).catch(() => Response.error()),
    );
    return;
  }

  // Static assets: cache first (hashed bundles + icons)
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icons/") || url.pathname === "/logo.svg") {
    event.respondWith(
      cacheFirst(request, RUNTIME_CACHE).catch(() => Response.error()),
    );
    return;
  }
});
