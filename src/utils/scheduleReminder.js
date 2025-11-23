// scheduleReminder.js — send messages to the Service Worker
export const scheduleAzanReminder = async (
  label,
  prayerTime,
  minutesBefore = 30,
) => {
  if (!('serviceWorker' in navigator)) {
    console.warn('No service worker support.');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const targetTime = new Date(prayerTime).getTime() - minutesBefore * 60 * 1000;

  if (targetTime <= Date.now()) {
    console.log(`⏱ ${label}: time already passed, skipping.`);
    return;
  }

  registration.active.postMessage({
    type: 'scheduleReminder',
    label,
    time: targetTime,
    sound: '/ding.mp3',
  });

  console.log(`✅ Scheduled ${label} ${minutesBefore} min before prayer.`);
};
