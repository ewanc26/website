// Service Worker for website performance optimization
const CACHE_NAME = 'website-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/fonts/ArrowType-Recursive-1.085/Recursive_Web/woff2_variable/Recursive_VF_1.085.woff2',
  '/scripts/themeLoader.js',
  '/favicon/favicon-32x32.png',
  '/favicon/apple-touch-icon.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.log('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'font') {
    // Cache fonts aggressively
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.destination === 'image') {
    // Cache images with network fallback
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Cache scripts and styles
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // For other requests, try network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache first strategy - check cache first, fallback to network
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a fallback response if available
    return new Response('Network error', { status: 408 });
  }
}

// Network first strategy - try network first, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error', { status: 408 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any background sync tasks
  console.log('Background sync triggered');
}
