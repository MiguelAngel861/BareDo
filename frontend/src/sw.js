/* Service Worker BareDo: cache-first para estaticos (con retry en cold start de Render) y network-first para navegaciones. */
const CACHE_NAME = "baredo-static-v2";
const PRECACHE = [
  "./",
  "./index.html",
  "./pages/login.html",
  "./pages/register.html",
  "./css/base.css",
  "./css/tasks.css",
  "./css/auth.css",
  "./js/app.js",
  "./js/api/base.js",
  "./js/api/auth.js",
  "./js/api/tasks.js",
  "./js/pages/login.js",
  "./js/pages/register.js",
  "./js/services/auth-session.js",
  "./js/services/task-service.js",
  "./js/ui/auth-form.js",
  "./js/ui/dom-utils.js",
  "./js/ui/form-handler.js",
  "./js/ui/task-form.js",
  "./js/ui/task-list.js",
  "./js/ui/toast.js",
];
const RETRY_MS = [500, 1500, 3000, 5000];
const STATIC_RE = /\.(css|js|svg|png|jpg|jpeg|gif|ico|woff2?)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.allSettled(PRECACHE.map((p) => cache.add(p)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

async function fetchWithRetry(request) {
  let last = null;
  for (const delay of RETRY_MS) {
    try {
      const response = await fetch(request);
      if (response.ok) return response;
      last = response;
    } catch {
      last = null;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  if (last) return last;
  throw new Error("network-failed");
}

async function putInCache(request, response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function revalidate(request) {
  try {
    const response = await fetchWithRetry(request);
    if (response && response.ok) await putInCache(request, response);
  } catch {
    /* instancia fria: se mantiene la copia en cache */
  }
}

async function staticStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    void revalidate(request);
    return cached;
  }
  const network = await fetchWithRetry(request).catch(() => null);
  if (network && network.ok) await putInCache(request, network);
  return network;
}

async function networkFirst(request) {
  let network = null;
  try {
    network = await fetchWithRetry(request);
  } catch {
    /* sin red: fallback cache */
  }
  if (network && network.ok) {
    if (request.method === "GET" && STATIC_RE.test(new URL(request.url).pathname)) {
      await putInCache(request, network);
    }
    return network;
  }
  return (await caches.match(request)) || (await caches.match("./index.html"));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(staticStrategy(request));
    return;
  }
  event.respondWith(networkFirst(request));
});