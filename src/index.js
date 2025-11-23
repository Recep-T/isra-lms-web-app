// src/index.js (FINAL — Optimized PWA + Firebase Notifications)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { HelmetProvider } from 'react-helmet-async';

// ⚡️ Callback holder for UpdatePrompt
let setRegistrationCallback = () => {};
const registerServiceWorker = (callback) => {
  setRegistrationCallback = callback;
};

// --- PWA & Notification Service Workers ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // ✅ 1. Register main PWA service worker
      const pwaRegistration =
        await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ PWA Service Worker registered:', pwaRegistration.scope);

      // Send registration to App (for UpdatePrompt)
      setRegistrationCallback(pwaRegistration);
      pwaRegistration.addEventListener('updatefound', () => {
        setRegistrationCallback(pwaRegistration);
      });

      // ✅ 2. Register Firebase notification worker (optional)
      const notifRegistration =
        await navigator.serviceWorker.register('/notification.js');
      console.log(
        '🔔 Firebase Notification SW registered:',
        notifRegistration.scope,
      );
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <App registerSW={registerServiceWorker} />
  </HelmetProvider>,
);
