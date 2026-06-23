const CACHE_NAME = "supply-pro-v1";
const ASSETS = [
  "/",
  "/home",
  "/products",
  "/orders",
  "/analytics",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[ServiceWorker] Failed to pre-cache ${url}:`, err);
          });
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Bypass caching for:
  // 1. Non-GET requests
  // 2. Next.js API routes (/api/)
  // 3. Hot Module Replacement (HMR) and development WebSockets (_next/)
  const isGet = event.request.method === "GET";
  const isApi = event.request.url.includes("/api/");
  const isHmr = event.request.url.includes("_next/") || event.request.url.includes("webpack");

  if (!isGet || isApi || isHmr) {
    return; // Bypass service worker intercept and load directly from network
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// Push notification listener
self.addEventListener("push", (event) => {
  let data = { title: "Supply Pro Update", body: "Operational state changed." };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data = { title: "Supply Pro Update", body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/orders"
      }
    })
  );
});

// Notification click action listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

