/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// ----------------------------------------------------------
//  🕌 Unified Service Worker (PWA + Firebase Notifications)
// ----------------------------------------------------------

importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging-compat.js');

const APP_VERSION = 'v1.2.0';
const CACHE_NAME = `sura-dashboard-cache-${APP_VERSION}`;

const firebaseConfig = {
  apiKey: 'AIzaSyDm5ivgv258DG0-JgSK3qBZ51niyQodANY',
  authDomain: 'azan-time-app.firebaseapp.com',
  databaseURL: 'https://azan-time-app-default-rtdb.firebaseio.com',
  projectId: 'azan-time-app',
  storageBucket: 'azan-time-app.firebasestorage.app',
  messagingSenderId: '933825769707',
  appId: '1:933825769707:web:316743ff5dbfc79a4a8eae',
  measurementId: 'G-CXCQ1341FE',
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ----------------------------------------------------------
// 🔔 Handle Background Firebase Messages
// ----------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log('📦 Received background message: ', payload);
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title || 'Azan Time App', {
    body: body || 'You have a new prayer reminder.',
    icon: icon || '/isra192.png',
  });
});

// ----------------------------------------------------------
// 🧭 Notification Click Handling
// ----------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ----------------------------------------------------------
// ⚙️  Offline Caching & PWA Setup
// ----------------------------------------------------------
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json?v=2',
  '/ding.mp3',
  'favicon.ico?v=2',
  'isra192.png?v=2',
  'isra512.png?v=2',
];

// Helper: safely cache assets
async function safeCacheAddAll(cache, urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch ${url}: ${response.status}`);
        continue;
      }
      await cache.put(url, response);
    } catch (err) {
      console.warn(`⚠️ Skipped ${url}: ${err.message}`);
    }
  }
}

// Listen for SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install: cache app shell safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('💾 Pre-caching assets...');
      await safeCacheAddAll(cache, urlsToCache);
      self.skipWaiting();
    })()
  );
});

// Fetch: cache-first, update in background
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET or cross-origin requests
  if (
    event.request.method !== 'GET' ||
    requestUrl.protocol === 'chrome-extension:' ||
    requestUrl.hostname.includes('aladhan.com') ||
    requestUrl.hostname !== self.location.hostname ||
    requestUrl.href.includes('googleapis') ||
    requestUrl.href.includes('firestore')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => new Response('Offline', { status: 503 }));
      return cachedResponse || fetchPromise;
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('🧹 Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
          .filter(Boolean)
      )
    )
  );
  self.clients.claim();
});
