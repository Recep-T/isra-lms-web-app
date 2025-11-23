export const PRAYER_API_URL = 'https://api.aladhan.com/v1/timings';
export const STORED_LOCATION_KEY = 'prayerAppLastLocation';
export const PREFS_KEY = 'prayerReminderPrefs';
export const DEMO_LAT = 41.0082;
export const DEMO_LON = 28.9784;

export const DEFAULT_PREFS = {
  enabled: true,
  minutesBefore: 60,
  sound: true,
  voice: false,
};

export const formatTimeRemaining = (ms) => {
  if (ms <= 0) return '00:00';
  let totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getNextPrayerWithRemainingTime = (timings) => {
  const now = new Date();
  const today = now.toDateString();
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const name of prayers) {
    const when = new Date(`${today} ${timings[name]}:00`);
    const remainingMs = when.getTime() - now.getTime();
    if (remainingMs > 0) return { name, time: timings[name], remainingMs };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const fajrTimeTomorrow = new Date(
    `${tomorrow.toDateString()} ${timings.Fajr}:00`,
  );
  return {
    name: 'Fajr',
    time: timings.Fajr,
    remainingMs: fajrTimeTomorrow - now,
  };
};
