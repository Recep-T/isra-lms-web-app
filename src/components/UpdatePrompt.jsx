import React, { useState, useEffect } from 'react';

export default function UpdatePrompt({ registration }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [versionInfo, setVersionInfo] = useState({
    current: '...',
    new: '...',
  });

  // 🟢 FADE-OUT KONTROLÜ İÇİN YETERLİDİR
  const [fadeOut, setFadeOut] = useState(false);

  // 📦 When update detected
  const handleUpdateDetected = (worker) => {
    setWaitingWorker(worker);
    worker.postMessage({ type: 'GET_VERSION' });
    setShowUpdate(true);
  };

  useEffect(() => {
    if (!registration) return;

    // 🚨 KONTROL: Prompt'un bir daha görünmesini engelleyen tek anahtar budur.
    const lastRefreshedVersion = localStorage.getItem('lastRefreshedVersion');

    // Request current SW version
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' });
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'VERSION_INFO') {
        const version = event.data.version;
        if (registration.waiting) {
          setVersionInfo((v) => ({ ...v, new: version }));

          // 🟢 YALNIZCA KULLANICI BU VERSİYONA REFRESH YAPMADIYSA GÖSTER
          if (version && lastRefreshedVersion !== version) {
            setShowUpdate(true);

            // 🛑 Otomatik gizleme kaldırıldı. Kullanıcı ya tıklar ya da sayfa kapanır.
            // setTimeout(() => setFadeOut(true), 5000); // ❌ Kaldırıldı!
          }
        } else {
          setVersionInfo((v) => ({ ...v, current: version }));
        }
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);

    const listener = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && registration.waiting) {
          handleUpdateDetected(registration.waiting);
          registration.waiting.postMessage({ type: 'GET_VERSION' });
        }
      });
    };
    registration.addEventListener('updatefound', listener);

    if (registration.waiting) {
      handleUpdateDetected(registration.waiting);
    }

    return () => {
      registration.removeEventListener('updatefound', listener);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [registration]);

  // 🔁 User confirms update
  const updateApp = () => {
    if (!waitingWorker) return;

    // 🟢 ÇÖZÜM: Kullanıcının bu versiyonu güncellediğini kaydet.
    // Bu, prompt'un bir daha görünmesini ENGELLEYECEK tek anahtardır.
    localStorage.setItem('lastRefreshedVersion', versionInfo.new);

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    // Instantly fade out
    setFadeOut(true);

    // Reload after short delay (Fade-out animasyonunun bitmesini bekle)
    setTimeout(() => window.location.reload(), 1200000);
  };

  // 🪄 Smooth fade-out effect (Kaybolma animasyonu)
  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => setShowUpdate(false), 500); // hide after animation
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  if (!showUpdate) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 
        bg-gradient-to-r from-green-500 to-emerald-600 text-white 
        px-4 py-3 rounded-2xl shadow-xl z-[100] w-[90%] sm:w-auto 
        text-center transition-all duration-500 ${
          fadeOut ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
    >
      <div className='flex flex-col items-center justify-center space-y-2'>
        <span className='font-semibold text-sm sm:text-base'>
          New version available!
        </span>

        <button
          onClick={updateApp}
          className='mt-2 px-5 py-1.5 bg-white text-green-700 font-medium 
            rounded-full text-sm shadow-md hover:bg-green-100 active:scale-95 
            transition-all duration-300'
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
