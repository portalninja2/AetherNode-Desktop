/**
 * AetherNode Desktop - Service Worker
 * PWA Offline Support & Caching
 */

const CACHE_NAME = 'aethernode-desktop-v1.0.0';
const STATIC_CACHE = 'aethernode-static-v1.0.0';
const DYNAMIC_CACHE = 'aethernode-dynamic-v1.0.0';

// Zu cachende Dateien
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/config.js',
    '/storage.js',
    '/utils.js',
    '/window-manager.js',
    '/hotkeys.js',
    '/pwa.js',
    '/app.js',
    '/manifest.json',
    // Icons würden hier stehen (wenn vorhanden)
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static files');
            return cache.addAll(STATIC_FILES);
        }).catch((error) => {
            console.error('[SW] Cache installation failed:', error);
        })
    );
    
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external URLs (apps in iframes)
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        networkFirstWithCacheFallback(request)
    );
});

/**
 * Network First Strategy with Cache Fallback
 */
async function networkFirstWithCacheFallback(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // If successful, update cache and return response
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // If network fails, try cache
        return await getCachedResponse(request);
        
    } catch (error) {
        console.log('[SW] Network failed, trying cache for:', request.url);
        return await getCachedResponse(request);
    }
}

/**
 * Get response from cache
 */
async function getCachedResponse(request) {
    // Try static cache first
    const staticCache = await caches.open(STATIC_CACHE);
    const staticResponse = await staticCache.match(request);
    
    if (staticResponse) {
        return staticResponse;
    }
    
    // Try dynamic cache
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const dynamicResponse = await dynamicCache.match(request);
    
    if (dynamicResponse) {
        return dynamicResponse;
    }
    
    // Fallback for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
        const fallbackCache = await caches.open(STATIC_CACHE);
        return fallbackCache.match('/index.html');
    }
    
    // Return error response
    return new Response('Offline - Resource not available', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Background Sync (für zukünftige Features)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'background-sync-apps') {
        event.waitUntil(syncApps());
    }
});

/**
 * Sync Apps (Placeholder für zukünftige Features)
 */
async function syncApps() {
    console.log('[SW] Syncing apps...');
    // Hier könnte App-Sync Logik implementiert werden
    return Promise.resolve();
}

// Push Notifications (für zukünftige Features)
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);
    
    const options = {
        body: 'AetherNode Desktop Update verfügbar',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png',
        tag: 'aethernode-update',
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('AetherNode Desktop', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll().then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data?.url || '/');
            }
        })
    );
});

// Message Handler (für Kommunikation mit App)
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
            
        case 'UPDATE_CACHE':
            updateCache(payload);
            break;
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

/**
 * Update specific cache
 */
async function updateCache(urls) {
    if (!Array.isArray(urls)) return;
    
    const cache = await caches.open(DYNAMIC_CACHE);
    return Promise.all(
        urls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return cache.put(url, response);
                }
            } catch (error) {
                console.error('[SW] Failed to update cache for:', url, error);
            }
        })
    );
}

// Periodic Background Sync (Chrome only)
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'app-sync') {
        event.waitUntil(syncApps());
    }
});

// Error Handler
self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker error:', event.error);
});

// Unhandled Rejection Handler
self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');