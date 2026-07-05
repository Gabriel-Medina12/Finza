const CACHE_NAME = 'finza-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json'
];

// Instalar Service Worker y almacenar en caché archivos principales
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Cache-First falling back to Network para velocidad de carga
self.addEventListener('fetch', (e) => {
  // Solo procesar peticiones con esquemas http y https (ignorar chrome-extension://, etc.)
  if (!e.request.url.startsWith('http://') && !e.request.url.startsWith('https://')) {
    return;
  }

  // Evitar interceptar llamadas a Supabase API, DolarApi o Gemini para que no den problemas
  if (
    e.request.url.includes('supabase.co') || 
    e.request.url.includes('dolarapi.com') ||
    e.request.url.includes('googleapis.com')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Guardar en caché respuestas de activos estáticos del propio dominio
        if (e.request.method === 'GET' && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
