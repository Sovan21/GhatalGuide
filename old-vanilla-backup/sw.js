// Service Worker for Ghatal Guide - PWA Caching

const CACHE_NAME = 'ghatal-guide-v2.1'; // ক্যাশ ভার্সন আপডেট করা হয়েছে
const urlsToCache = [
    '/',
    './script.js',
    './add-business.js',
    './index.html',
    './add-business.html',
    './manifest.json',
    './logo.png',
    './icon-192x192.png',
    './icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', // Google Fonts
    'https://cdn.tailwindcss.com', // Tailwind CSS
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80&auto=format&ixlib=rb-4.0.3' // ফলব্যাক ইমেজ
];

// 1. Install Service Worker and cache assets
self.addEventListener('install', event => {
    console.log('SW: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('SW: Failed to cache', error);
            })
    );
});

// 2. Activate Service Worker and clean up old caches
self.addEventListener('activate', event => {
    console.log('SW: Activate event');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// 3. Fetch event - Stale-While-Revalidate for API calls, Cache First for others
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // API requests (Stale-While-Revalidate strategy)
    // This serves data from cache immediately for speed, then updates it from the network.
    if (url.origin === 'https://gfdfhonfpbvyeogoqwbv.supabase.co') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const networkFetch = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(err => {
                        console.error('SW: Network fetch failed for API.', err);
                        // If network fails, we've already served the cached response (if it existed)
                    });

                    // Return cached response immediately, while the network request runs in the background.
                    return cachedResponse || networkFetch;
                });
            })
        );
        return;
    }

    // For all other assets (Cache First strategy)
    // This serves assets directly from cache if they exist.
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return from cache if found
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Otherwise, fetch from network, cache it, and return it
                return fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
    );
});

// 4. Push event - Handle incoming push notifications
self.addEventListener('push', event => {
    console.log('SW: Push Received.');
    const data = event.data.json(); // Assuming the payload is JSON

    const title = data.title || 'Ghatal Guide';
    const options = {
        body: data.body || 'You have a new notification.',
        icon: './icon-192x192.png', // Icon for the notification
        badge: './logo.png', // Small monochrome icon for the status bar
        data: {
            url: data.url || '/' // URL to open on click
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Notification click event - Open the correct URL when notification is clicked
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Close the notification
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(clients.openWindow(urlToOpen));
});