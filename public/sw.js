const CACHE_NAME = "gameday-map-v3";
const OFFLINE_URL = "/offline";
const SHELL_ROUTES = ["/", "/app", "/today", "/nyc/map", "/nyc/matches", "/manifest.json", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ROUTES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_CITY_CONTEXT") return;

  const cityKey = event.data.cityKey || "nyc";
  event.waitUntil(cacheCityContext(cityKey));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/") || url.pathname.match(/\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && request.url.startsWith(self.location.origin)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok && request.url.startsWith(self.location.origin)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(async () => {
      if (cached) return cached;
      if (request.mode === "navigate") {
        return cache.match(OFFLINE_URL);
      }
      return undefined;
    });

  return cached ?? fetchPromise;
}

async function cacheCityContext(cityKey) {
  const cache = await caches.open(CACHE_NAME);
  const cityRoutes = [`/${cityKey}/map`, `/${cityKey}/matches`, "/today", "/app"];

  await Promise.all(
    cityRoutes.map(async (route) => {
      try {
        const response = await fetch(route, { credentials: "same-origin" });
        if (response.ok) {
          await cache.put(route, response.clone());
        }
      } catch (error) {
        // Ignore offline cache refresh failures; existing cache entries still work.
      }
    })
  );
}
