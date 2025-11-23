/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// 🔔 Firebase Cloud Messaging background handler

importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js');

// ✅ Initialize Firebase (same config as firebase.js)
firebase.initializeApp({
  apiKey: 'AIzaSyDm5ivgv258DG0-JgSK3qBZ51niyQodANY',
  authDomain: 'azan-time-app.firebaseapp.com',
  databaseURL: 'https://azan-time-app-default-rtdb.firebaseio.com',
  projectId: 'azan-time-app',
  storageBucket: 'azan-time-app.firebasestorage.app',
  messagingSenderId: '933825769707',
  appId: '1:933825769707:web:316743ff5dbfc79a4a8eae',
  measurementId: 'G-CXCQ1341FE',
});

const messaging = firebase.messaging();

// 🎯 Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const { title, body } = payload.notification || {};
  const notificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-512.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  // Display system notification
  self.registration.showNotification(title || 'Prayer Reminder', notificationOptions);
});

// 👆 Open app when notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
