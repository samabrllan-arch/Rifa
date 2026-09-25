const CACHE_NAME = 'rifa-kalley-v3.6.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './css/style.css',
  './css/admin.css',
  './js/app.js',
  './js/ticket-generator.js',
  './js/pwa-install.js',
  './js/admin.js',
  './img/olla-kalley.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/favicon.png'
];

// Instalación: Precargar recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Precaché v3.0.0 iniciado');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza inmediata de cachés antiguas y control inmediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Purgando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Si es petición a la API, Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          success: false,
          offline: true,
          error: 'Estás sin conexión a internet. Los cambios se sincronizarán al reconectar.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Para documentos HTML o navegación: Network-First con fallback a Caché
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para recursos estáticos (CSS, JS, imágenes): Network-First o Stale-While-Revalidate
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
