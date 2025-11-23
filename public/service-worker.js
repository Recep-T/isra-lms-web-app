// /* eslint-disable no-restricted-globals */
// const APP_VERSION = 'v1.1.4'; // 🚨 SÜRÜM YÜKSELTİLDİ!
// const CACHE_NAME = `sura-dashboard-cache-${APP_VERSION}`;

// // İkonların yeni versiyonlu yolları eklendi
// const urlsToCache = [
//   '/', 
//   '/index.html', 
//   '/ding.mp3', 
//   '/manifest.json?v=2',
//   'favicon.ico?v=2', 
//   'isra192.png?v=2', 
//   'isra512.png?v=2',
//   // ⚠️ Buraya diğer önemli varlıklarınızı da eklemeyi unutmayın
// ];

// // ✅ Helper: safely add all cacheable resources
// async function safeCacheAddAll(cache, urls) {
//   for (const url of urls) {
//     try {
//       // NOTE: Using 'no-store' cache avoids potential issues with HTTP cache headers
//       const response = await fetch(url, { cache: 'no-store' });
//       if (!response.ok) {
//         console.warn(`⚠️ Failed to fetch ${url}: ${response.status} ${response.statusText}`);
//         continue;
//       }
//       await cache.put(url, response);
//     } catch (err) {
//       console.warn(`⚠️ Skipped ${url}: ${err.message}`);
//     }
//   }
// }

// // Listen for SKIP_WAITING message
// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });

// // Install: cache app shell safely
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     (async () => {
//       const cache = await caches.open(CACHE_NAME);
//       console.log('Service Worker: Pre-caching assets...');
//       await safeCacheAddAll(cache, urlsToCache);
//       // self.skipWaiting(); 
//     })()
//   );
// });

// // Fetch: cache-first, update in background
// self.addEventListener('fetch', (event) => {
//   const requestUrl = new URL(event.request.url);

//   // Skip non-GET or cross-origin requests
//   if (
//     event.request.method !== 'GET' ||
//     requestUrl.protocol === 'chrome-extension:' ||
//     // Allow for data from AlAdhan API to bypass caching logic
//     requestUrl.hostname.includes('aladhan.com') ||
//     requestUrl.hostname !== self.location.hostname ||
//     requestUrl.href.includes('googleapis') ||
//     requestUrl.href.includes('firestore')
//   ) {
//     // ⭐️ If request is not cacheable (e.g., API calls), fetch normally
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       const fetchPromise = fetch(event.request)
//         .then((networkResponse) => {
          
//           // ⭐️ CRITICAL FIX: Clone the response *before* using it for caching.
//           // This ensures the original response stream can be returned to the browser.
//           const responseToCache = networkResponse.clone(); 
          
//           if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
//             caches.open(CACHE_NAME).then((cache) => {
//               // Use the CLONED response for caching
//               cache.put(event.request, responseToCache); 
//             });
//           }
//           // Return the original networkResponse to the browser
//           return networkResponse;
//         })
//         .catch(() => {
//           // Fallback response if both cache and network fail (or network is offline)
//           return new Response('Offline', { status: 503 });
//         });

//       // Use cached response if available, otherwise go to network
//       return cachedResponse || fetchPromise;
//     })
//   );
// });

// // Activate: clean up old caches (FIXED)
// self.addEventListener('activate', (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) =>
//       Promise.all(
//         cacheNames.map((cacheName) => {
//           if (!cacheWhitelist.includes(cacheName)) {
//             console.log('Service Worker: Removing old cache:', cacheName);
//             return caches.delete(cacheName);
//           }
//           // ⭐️ FIX: Explicitly return null or false instead of letting it be undefined
//           return null;
//         })
//         // ⭐️ FIX: Filter out the null/false values before Promise.all
//         .filter(p => p !== null) 
//       )
//     )
//   );
//   self.clients.claim();
// });