import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import { FaKaaba } from 'react-icons/fa'; // cool Kaaba icon
import QiblaFinderModal from './QiblaFinderModal';
import GoldenTimeClock from './SpritualTimeline';
import { scheduleAzanReminder } from '../utils/scheduleReminder';

// Harici paket bağımlılığını önlemek için simgeler inline SVG olarak tanımlanmıştır.
const HiLocationMarker = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M10 2a6 6 0 00-6 6c0 4.478 4.793 9.774 5.485 10.515a.75.75 0 001.03 0C11.207 17.774 16 12.478 16 8a6 6 0 00-6-6zm0 8a2 2 0 100-4 2 2 0 000 4z'
      clipRule='evenodd'
    />
  </svg>
);
const HiClock = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.5 7a.5.5 0 00-1 0v5.5a.5.5 0 00.5.5h4a.5.5 0 000-1h-3V7z'
      clipRule='evenodd'
    />
  </svg>
);
const HiArrowNarrowRight = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
      clipRule='evenodd'
    />
  </svg>
);
const HiSun = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM4.685 4.685a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm10.63 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10 16a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zM3.204 9.388a.75.75 0 01.706-.593h12.18c.277 0 .524.18.593.456l.004.015a.75.75 0 01-.593.706l-.015.004H3.882a.75.75 0 01-.706-.593l-.004-.015a.75.75 0 01.593-.706zM3.975 14.685a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm10.63 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06z'
      clipRule='evenodd'
    />
  </svg>
);
const HiMoon = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path d='M7 2a.75.75 0 00-.75.75c0 1.543.376 3.072 1.15 4.453l-.973.848a.75.75 0 00.58 1.378l2.973-1.487A7.5 7.5 0 0116.75 16h-.75a.75.75 0 000 1.5h.75a.75.75 0 00.75-.75A8.5 8.5 0 007 2.75V2z' />
  </svg>
);
const HiCloud = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M5.5 8.75a.75.75 0 000 1.5h1.25V12a.75.75 0 001.5 0v-1.75H12a.75.75 0 000-1.5h-3.75V5.5a.75.75 0 00-1.5 0v2.5H5.5zM15 10a5 5 0 11-5-5 5 5 0 015 5z'
      clipRule='evenodd'
    />
  </svg>
);
const HiMap = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M10.244 3.012a.75.75 0 00-.488 0l-5 2.25A.75.75 0 004 6.015v11.235a.75.75 0 00.999.734l5.25-1.5a.75.75 0 00.49.006l5.25 1.5a.75.75 0 001.01-.734V6.015a.75.75 0 00-.756-.753l-5-2.25zM10.5 5.163l4 1.8V16.63L10.5 15.4V5.163zM5.5 6.965l4-1.8v10.707l-4 1.144V6.965z'
      clipRule='evenodd'
    />
  </svg>
);

// ---- Helpers for reminders ----
const PRAYER_API_URL = 'https://api.aladhan.com/v1/timings';
const STORED_LOCATION_KEY = 'prayerAppLastLocation';
const PREFS_KEY = 'prayerReminderPrefs';
const DEMO_LAT = 41.0082;
const DEMO_LON = 28.9784;

// ⭐️ FIXED: Simplified DEFAULT_PREFS (no customSelected)
const DEFAULT_PREFS = {
  enabled: true,
  minutesBefore: 30, // New default is 30 minutes (one of the new fixed options)
  sound: true,
  voice: false,
};

const formatTimeRemaining = (ms) => {
  if (ms <= 0) return '00m 00s';
  let totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return [
    ...(hours > 0 ? [`${hours}h`] : []),
    `${pad(minutes)}m`,
    `${pad(seconds)}s`,
  ].join(' ');
};

const getNextPrayerWithRemainingTime = (timings) => {
  const now = new Date();
  const today = now.toDateString();
  const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Sunrise', time: timings.Sunrise },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha },
  ];
  for (const p of prayers) {
    const when = new Date(`${today} ${p.time}:00`);
    const remainingMs = when.getTime() - now.getTime();
    if (remainingMs > 0) return { name: p.name, time: p.time, remainingMs };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tDate = tomorrow.toDateString();
  const fajrTimeTomorrow = new Date(`${tDate} ${timings.Fajr}:00`);
  const remainingMs = fajrTimeTomorrow.getTime() - now.getTime();
  return { name: 'Fajr', time: timings.Fajr, remainingMs };
};

export default function PrayerTimeLanding() {
  const [timings, setTimings] = useState(null);
  const [locationName, setLocationName] = useState('Unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);

  const [manualInput, setManualInput] = useState('');
  const [isManualEntryNeeded, setIsManualEntryNeeded] = useState(false);

  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ⭐️ FIXED: Simplified Reminder prefs state initialization
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY));
      // Define valid options for minutesBefore
      const validOptions = [30, 45, 60];

      let minutesBefore = saved?.minutesBefore;
      // Ensure the loaded minutesBefore is one of the valid options, otherwise use default
      if (!validOptions.includes(Number(minutesBefore))) {
        minutesBefore = DEFAULT_PREFS.minutesBefore;
      }

      // Explicitly remove customSelected if it was previously saved
      const finalPrefs = {
        ...DEFAULT_PREFS,
        ...(saved || {}),
        minutesBefore: minutesBefore,
      };
      delete finalPrefs.customSelected;
      return finalPrefs;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const timersRef = useRef([]); // store active timeouts to clear on reschedule
  const navigate = useNavigate();
  const hasAttemptedGeolocation = useRef(false);

  // -- Save prefs when changed
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // -- Request Notification permission early (best-effort)
  useEffect(() => {
    if (!prefs.enabled) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [prefs.enabled]);

  // -- Sound priming helper
  // NOTE: Keeping new Audio('/ding.mp3') based on your confirmation
  useEffect(() => {
    audioRef.current = new Audio('/ding.mp3');
    audioRef.current.volume = 1.0;
  }, []);

  const playSound = useCallback(() => {
    if (!prefs.sound || !audioRef.current) return;
    try {
      const a = audioRef.current;
      a.pause();
      a.currentTime = 0; // reset to start
      a.play().catch((err) => {
        console.warn('Audio play blocked or failed:', err);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }, [prefs.sound]);

  // -- Speak helper
  const speak = useCallback(
    (text) => {
      if (!prefs.voice) return;
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 1;
        window.speechSynthesis?.speak(u);
      } catch (e) {
        console.warn('Speech synthesis failed:', e);
      }
    },
    [prefs.voice],
  );

  // -- Schedule reminders for each prayer based on prefs
  const scheduleReminders = useCallback(
    (t) => {
      // clear previous timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      if (!t || !prefs.enabled) return;

      const now = new Date();
      const todayStr = now.toDateString();
      // ⭐️ FIXED: minutesBefore is now guaranteed to be a valid number (30, 45, or 60)
      const minutesBefore =
        Number(prefs.minutesBefore) || DEFAULT_PREFS.minutesBefore;
      const skip = new Set(['Sunrise']); // skip Sunrise if you want

      Object.entries(t).forEach(([name, time]) => {
        if (skip.has(name)) return;

        const [hStr, mStr] = time.split(':');
        const h = Number(hStr),
          m = Number(mStr);
        if (Number.isNaN(h) || Number.isNaN(m)) return;

        const prayerTime = new Date(
          `${todayStr} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
        );
        const remindTime = new Date(
          prayerTime.getTime() - minutesBefore * 60 * 1000,
        );
        const delay = remindTime.getTime() - Date.now();

        if (delay > 0) {
          // schedule
          const id = setTimeout(() => {
            // System notification
            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`${name} Prayer Reminder`, {
                body: `${name} prayer is in ${minutesBefore} minute(s).`,
                icon: '/remind.png',
              });
            }
            // Sound & voice
            playSound();
            speak(`${name} prayer is in ${minutesBefore} minutes.`);
          }, delay);
          timersRef.current.push(id);
          // Console hint for dev:
          console.log(
            `⏱ Scheduled ${name} in ${Math.round(delay / 60000)} min (reminder ${minutesBefore}m before).`,
          );
        }
        // / 🚀 NEW: Also send to Service Worker
        scheduleAzanReminder(name, prayerTime, minutesBefore);
        console.log(
          `📩 Sent ${name} reminder to Service Worker (${minutesBefore} min before).`,
        );
      });
    },
    [prefs.enabled, prefs.minutesBefore, playSound, speak],
  );

  // ... (rest of the component logic is unchanged)

  /**
   * Konum Verilerini LocalStorage'a Kaydeder
   */
  const saveLocation = (lat, lon, name) => {
    try {
      localStorage.setItem(
        STORED_LOCATION_KEY,
        JSON.stringify({ lat, lon, name, timestamp: Date.now() }),
      );
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  };

  const handleLocationError = useCallback((err) => {
    console.warn('Location access failed:', err.message);
    setError(
      `Location access failed or denied. Please enter a location manually to continue.`,
    );
    setLoading(false);
    setIsManualEntryNeeded(true);
  }, []);

  // Fetch timings
  const fetchPrayerTimes = useCallback(
    async (latitude, longitude, name = null, save = true) => {
      setLoading(true);
      setError('');
      try {
        const date = new Date();
        const response = await fetch(
          `${PRAYER_API_URL}/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=2`,
        );
        if (!response.ok) throw new Error('API ile iletişim kurulamadı.');
        const data = await response.json();

        if (data.code === 200 && data.status === 'OK') {
          const newTimings = data.data.timings;
          setTimings(newTimings);

          const defaultName =
            data.data.meta.timezone.split('/')[1]?.replace('_', ' ') ||
            'Fetched Location';
          const finalName = name || defaultName;
          setLocationName(finalName);
          setError('');

          const next = getNextPrayerWithRemainingTime(newTimings);
          setNextPrayer(next);
          setTimeRemainingMs(next.remainingMs);

          if (save) saveLocation(latitude, longitude, finalName);
        } else {
          setError("API'dan namaz vakitleri alınamadı.");
        }
      } catch (err) {
        console.error('Prayer time error:', err);
        setError('Namaz vakitleri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  const handleResetLocation = async () => {
    try {
      setLoading(true);
      setError('');

      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          // 🗺️ Fetch city name using OpenStreetMap reverse geocoding
          const getCityName = async (lat, lon) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
              );
              const data = await res.json();
              return (
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                'Unknown Location'
              );
            } catch {
              return 'Unknown Location';
            }
          };

          const cityName = await getCityName(latitude, longitude);

          // ✅ Fetch and update prayer times for new live location
          await fetchPrayerTimes(latitude, longitude, cityName, true);

          // Update UI
          setLocationName(cityName);
          setError('');
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
          setError(
            'Unable to fetch live location. Please enable location permissions or try again.',
          );
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } catch (e) {
      console.error('Location reset failed:', e);
      setError('Failed to reset location.');
      setLoading(false);
    }
  };

  // Initial load: localStorage → geolocation
  useEffect(() => {
    if (hasAttemptedGeolocation.current) return;
    hasAttemptedGeolocation.current = true;

    let isMounted = true;
    const loadTimes = async () => {
      const stored = localStorage.getItem(STORED_LOCATION_KEY);
      if (stored) {
        try {
          const { lat, lon, name } = JSON.parse(stored);
          if (lat && lon && name) {
            await fetchPrayerTimes(lat, lon, name, false);
            if (isMounted) setLoading(false);
            return;
          }
        } catch {}
      }

      if (navigator.geolocation && isMounted) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return;
            const { latitude, longitude } = pos.coords;
            fetchPrayerTimes(latitude, longitude, 'Live Location', true);
          },
          (err) => {
            if (isMounted) handleLocationError(err);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else if (isMounted) {
        handleLocationError({
          message: 'Geolocation is not supported by this browser.',
        });
      }
    };

    loadTimes();
    return () => {
      isMounted = false;
    };
  }, [fetchPrayerTimes, handleLocationError]);

  // Countdown tick
  useEffect(() => {
    if (timeRemainingMs > 0) {
      const timer = setInterval(() => {
        setTimeRemainingMs((prev) => {
          const next = prev - 1000;
          if (next <= 0 && timings) {
            clearInterval(timer);
            setTimeout(() => {
              const n = getNextPrayerWithRemainingTime(timings);
              setNextPrayer(n);
              setTimeRemainingMs(n.remainingMs);
            }, 1000);
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemainingMs, timings]);

  // Manual location submit (demo geocode → Istanbul)
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a valid city or zip code.');
      return;
    }
    setError('');
    setLoading(true);
    setIsManualEntryNeeded(false);
    fetchPrayerTimes(DEMO_LAT, DEMO_LON, manualInput, true);
  };

  // 🆕 Schedule (or reschedule) reminders whenever timings or prefs change
  useEffect(() => {
    scheduleReminders(timings);
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [timings, prefs, scheduleReminders]);

  // Loading screen
  if (loading && !isManualEntryNeeded) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-6'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent'></div>
        <p className='mt-4 text-indigo-700 font-medium'>
          Fetching location and prayer times...
        </p>
      </div>
    );
  }

  const prayerIcons = {
    Fajr: <HiCloud className='w-6 h-6 text-blue-400' />,
    Sunrise: <HiSun className='w-6 h-6 text-yellow-500' />,
    Dhuhr: <HiSun className='w-6 h-6 text-orange-500' />,
    Asr: <HiCloud className='w-6 h-6 text-gray-500' />,
    Maghrib: <HiMoon className='w-6 h-6 text-purple-600' />,
    Isha: <HiMoon className='w-6 h-6 text-blue-900' />,
  };

  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    // Max width set to xl is good for centering on larger screens
    <div className='min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 sm:px-4'>
      {/* 🕋 1️⃣ PRAYER TIME SECTION (TOP PRIORITY) - Keep existing styles */}
      {timings && nextPrayer && !isManualEntryNeeded && (
        <section className='w-full max-w-xl px-2 sm:px-4 space-y-6 sm:space-y-8 flex flex-col items-center mb-8 sm:mb-10'>
          <h1
            className='text-2xl sm:text-4xl font-extrabold leading-tight text-center 
  bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 drop-shadow-sm'
          >
            Your Daily Compass
          </h1>
          {/* 🌅 Next Prayer Card (Existing styles look good) */}
          <div className='relative w-full'>
            <div className='absolute -inset-1 bg-blue-200/20 blur-2xl rounded-3xl'></div>
            <div className='relative bg-gradient-to-b from-white to-blue-50 rounded-3xl shadow-md p-5 sm:p-6 border border-blue-100'>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 font-semibold'>
                    Next Prayer
                  </p>
                  <p className='text-base sm:text-lg font-bold text-blue-700 mt-1'>
                    {nextPrayer.name}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-[10px] uppercase tracking-wider text-gray-400 font-semibold'>
                    Time Remaining
                  </p>
                  <p className='text-base font-bold text-red-500 leading-tight'>
                    {formatTimeRemaining(timeRemainingMs)}
                  </p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-3 sm:mt-4'>
                <span className='text-5xl sm:text-7xl font-extrabold text-blue-600 leading-none drop-shadow-sm'>
                  {nextPrayer.time}
                </span>
              </div>
            </div>
          </div>

          {/* 🕰️ Full Prayer Timings Card (Existing styles look good) */}
          <div className='w-full bg-white p-5 rounded-3xl shadow-md border border-gray-100'>
            <h3 className='text-xl sm:text-2xl font-bold text-gray-700 mb-3 sm:mb-4 border-b pb-2 flex items-center'>
              <HiClock className='w-5 h-5 mr-2 text-blue-500' />
              Today's Full Timings
            </h3>
            <div className='divide-y divide-gray-100'>
              {prayerOrder.map((name) => {
                if (!timings[name]) return null;
                const isNext = nextPrayer && nextPrayer.name === name;
                return (
                  <div
                    key={name}
                    className={`flex justify-between items-center py-2 sm:py-2 px-2 sm:px-3 rounded-xl transition ${
                      isNext
                        ? 'bg-indigo-50 font-semibold border border-indigo-100'
                        : ''
                    }`}
                  >
                    <span className='flex items-center text-base sm:text-lg text-gray-700'>
                      {prayerIcons[name]}
                      <span className='ml-3'>{name}</span>
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-mono ${isNext ? 'text-blue-600' : 'text-gray-800'}`}
                    >
                      {timings[name]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 🕌 2️⃣ HEADER & BUTTONS SECTION - STYLED WITH ORIGINAL COLORS AND REDUCED PADDING */}
      <header className='text-center w-full max-w-xl px-2 sm:px-4 mb-8'>
        {/* Location Display */}
        <p className='text-base sm:text-lg text-gray-800 mb-6 flex items-center justify-center font-medium'>
          <HiLocationMarker className='w-5 h-5 mr-2 text-blue-500' />
          <span className='text-gray-600'>Location:</span>
          <span className='font-extrabold text-blue-800 ml-1'>
            {locationName}
          </span>
        </p>

        {/* Button Group */}
        <div className='flex flex-col items-center justify-center gap-3 sm:gap-4'>
          {/* 1. Daily Check-in Button (Original Indigo/Purple Gradient, Reduced Padding) */}
          <button
            onClick={() => navigate('/login')}
            className='w-full flex items-center justify-center gap-2 px-5 py-2 
            bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
            text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl 
            active:scale-95 transition-all duration-300'
          >
            <span>Daily Check-In</span>
            <HiArrowNarrowRight className='w-5 h-5' />
          </button>

          {/* 2 & 3. Location and Qibla Buttons (Original Pink/Red/Yellow Gradient, Reduced Padding) */}
          <div className='flex w-full gap-3 sm:gap-4'>
            {/* Location Button */}
            <button
              onClick={handleResetLocation}
              disabled={loading}
              className='w-1/2 flex items-center justify-center gap-2 px-3 py-2
                bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
                text-white text-base font-bold rounded-2xl shadow-lg hover:scale-[1.02] 
                active:scale-95 transition-all duration-300 disabled:opacity-50'
              title='Find my location'
            >
              <HiLocationMarker className='w-5 h-5' />
              <span className='text-base'>Location</span>
            </button>

            {/* Qibla Button */}
            <button
              onClick={() => setIsQiblaOpen(true)}
              className='w-1/2 flex items-center justify-center gap-2 px-3 py-2
                bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
                text-white text-base font-bold rounded-2xl shadow-lg hover:scale-[1.02] 
                active:scale-95 transition-all duration-300'
              title='Find Qibla Direction'
            >
              <FaKaaba className='w-5 h-5 transform rotate-180' />
              <span className='text-base'>Qibla</span>
            </button>
          </div>

          {/* 4. Notification Button (Original Indigo/Purple Gradient, Reduced Padding) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className='w-full flex items-center justify-center gap-2 px-5 py-2
            bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
            text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl 
            active:scale-95 transition-all duration-300'
          >
            <span>Notification</span>
            <span role='img' aria-label='bell' className='text-xl'>
              🔔
            </span>
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        prefs={prefs}
        setPrefs={setPrefs}
        playSound={playSound}
        // ✅ NOTE: You need to pass the 'speak' function if you want the Test Voice button to work in SettingsModal
        speak={speak}
      />

      {/* ⚠️ ERROR / MANUAL ENTRY (Keep existing styles) */}
      {error && (
        <div className='bg-red-100 text-red-700 p-4 rounded-lg shadow-md w-full max-w-xl mb-6 text-sm mx-2 sm:mx-0'>
          ⚠️ {error}
        </div>
      )}

      {isManualEntryNeeded && (
        <div className='w-full max-w-xl px-4 space-y-4 bg-white p-5 sm:p-6 rounded-2xl shadow-xl mb-6 mx-2 sm:mx-0'>
          <h3 className='text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center'>
            <HiMap className='w-6 h-6 mr-2 text-indigo-500' />
            Enter Location Manually
          </h3>
          <p className='text-sm text-red-500 mb-4 font-semibold'>
            ⚠️ ACTION REQUIRED: Geolocation failed. Please enter your location.
          </p>
          <input
            type='text'
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder='City, Country or Zip Code (e.g., London, UK)'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm'
          />
          <button
            onClick={handleManualSubmit}
            className='w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition text-sm'
          >
            Get Prayer Times
          </button>
        </div>
      )}
      {/* 🌞 ZAMANIN ALTIN DİLİMİ */}
      {timings && !isManualEntryNeeded && (
        <section className='w-full max-w-xl mt-10'>
          <GoldenTimeClock timings={timings} />
        </section>
      )}
      {/* 🕋 QIBLA FINDER MODAL */}
      <QiblaFinderModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
      />
    </div>
  );
}
