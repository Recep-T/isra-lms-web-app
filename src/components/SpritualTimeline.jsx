import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSyncAlt, FaTimes } from 'react-icons/fa';
import PrayerModal from './PrayerModal';

const WELCOME_MODAL_KEY = 'spiritual_timeline_welcome_seen';

export default function SpiritualTimelineResponsive() {
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('spiritual_timeline_completed');
    return saved ? JSON.parse(saved) : [];
  });
  const [active, setActive] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isVisible, setIsVisible] = useState(
    !sessionStorage.getItem('spiritual_timeline_closed'),
  );

  const canvasRef = useRef(null);

  const timeline = [
    { key: 'tahajjud', time: '03:00', label: 'Tahajjud' },
    { key: 'fajr', time: '06:00', label: 'Fajr' },
    { key: 'travel', time: '08:00', label: 'Travel Dua' },
    { key: 'work', time: '09:00', label: 'Start of Work Dua' },
    { key: 'duha', time: '10:00', label: 'Duha' },
    { key: 'dhuhr', time: '12:00', label: 'Dhuhr' },
    { key: 'asr', time: '16:00', label: 'Asr' },
    { key: 'maghrib', time: '18:00', label: 'Maghrib' },
    { key: 'evening_duas', time: '19:00', label: 'Evening Dhikr' },
    { key: 'isha', time: '21:00', label: 'Isha' },
  ];

  useEffect(() => {
    localStorage.setItem(
      'spiritual_timeline_completed',
      JSON.stringify(completed),
    );
  }, [completed]);

  useEffect(() => {
    if (!sessionStorage.getItem(WELCOME_MODAL_KEY)) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem(WELCOME_MODAL_KEY, 'true');
  };

  const handleComplete = (key) => {
    setCompleted((prev) => {
      const updated = [...new Set([...prev, key])];
      if (updated.length === timeline.length) {
        setCelebrate(true);
      }
      return updated;
    });
    setActive(null);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset today's progress? This will reset all completed items.",
      )
    ) {
      setCompleted([]);
      setCelebrate(false);
    }
  };

  const handleCloseTimeline = () => {
    setIsVisible(false);
    sessionStorage.setItem('spiritual_timeline_closed', 'true');
  };

  const progress = (completed.length / timeline.length) * 100;

  useEffect(() => {
    if (!celebrate || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 6 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      speed: Math.random() * 3 + 2,
    }));

    let animationFrame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speed;
        if (p.y > canvas.height) p.y = -10;
      });
      animationFrame = requestAnimationFrame(draw);
    };
    draw();

    const timeout = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCelebrate(false);
    }, 6000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeout);
    };
  }, [celebrate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50, transition: { duration: 0.3 } }}
          className='bg-gradient-to-br from-yellow-50 via-amber-100 to-orange-50 rounded-3xl p-8 shadow-lg border border-yellow-200 space-y-6 relative overflow-hidden max-w-4xl mx-auto my-8'
        >
          {/* Header */}
          <div className='flex justify-between items-center pb-4 border-b border-yellow-200'>
            <h2 className='text-2xl font-extrabold text-yellow-700 flex items-center gap-2'>
              Daily Spiritual Timeline ✨
            </h2>

            <div className='flex gap-3'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetProgress}
                className='flex items-center gap-2 text-sm font-semibold bg-red-100 text-red-600 px-3 py-2 rounded-full border border-red-300 hover:bg-red-200 transition'
              >
                <FaSyncAlt />
                Reset
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseTimeline}
                className='flex items-center gap-2 text-sm font-semibold bg-gray-200 text-gray-700 px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-300 transition'
              >
                <FaTimes />
                Close
              </motion.button>
            </div>
          </div>

          {/* Timeline */}
          <div className='border-t border-yellow-200 pt-6 space-y-6 text-center'>
            <h3 className='text-xl font-bold text-yellow-700'>
              Today's Schedule
            </h3>

            {/* Mobile Timeline */}
            <div className='flex flex-col items-center space-y-6 sm:hidden relative'>
              <div className='absolute left-1/2 top-6 bottom-6 w-1 bg-yellow-200 rounded-full -translate-x-1/2' />
              {timeline.map((t, i) => {
                const isDone = completed.includes(t.key);
                return (
                  <motion.div
                    key={t.key}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActive(t.key)}
                    className='relative flex flex-col items-center'
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shadow-md z-10 transition ${
                        isDone
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-yellow-500'
                          : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className='mt-2 text-xs font-semibold text-gray-700 w-28'>
                      {t.label}
                    </div>
                    <span className='text-[10px] text-gray-500'>{t.time}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Timeline */}
            <div className='hidden sm:flex flex-wrap items-center justify-between relative px-4'>
              <div className='absolute left-8 right-8 top-1/2 h-2 bg-gray-200 rounded-full -translate-y-1/2'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                  className='h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full'
                />
              </div>

              {timeline.map((t, i) => {
                const isDone = completed.includes(t.key);
                return (
                  <motion.div
                    key={t.key}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setActive(t.key)}
                    className='relative flex flex-col items-center mx-2 my-4'
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shadow-md transition ${
                        isDone
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-yellow-500'
                          : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className='mt-2 text-xs font-semibold text-gray-700 w-28 text-center'>
                      {t.label}
                    </div>
                    <span className='text-[10px] text-gray-500'>{t.time}</span>
                  </motion.div>
                );
              })}
            </div>

            <p className='text-sm text-gray-700 italic'>
              Tap each moment to open its reflection ✨
            </p>
          </div>

          {/* Celebration */}
          {celebrate && (
            <div className='fixed inset-0 flex flex-col items-center justify-center z-50'>
              <canvas ref={canvasRef} className='absolute inset-0'></canvas>
              <motion.h1
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120 }}
                className='text-4xl sm:text-5xl font-extrabold text-yellow-100 drop-shadow-lg'
              >
                🎉 Great Job, MashaAllah!
              </motion.h1>
              <p className='text-lg text-amber-100 italic'>
                You’ve completed today’s journey 🌙
              </p>
            </div>
          )}

          {/* Prayer Modal */}
          {active && (
            <PrayerModal
              prayerKey={active}
              prayerTime={timeline.find((t) => t.key === active)?.time}
              onComplete={handleComplete}
              onClose={() => setActive(null)}
            />
          )}

          {/* Welcome Modal */}
          {showWelcomeModal && (
            <motion.div
              className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className='bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4'
              >
                <h3 className='text-2xl font-bold text-green-600'>
                  Welcome! 🕌
                </h3>
                <p className='text-gray-600'>
                  Before starting your Daily Spiritual Timeline, take a moment
                  to view today’s tasks. Your progress will be saved until you
                  manually reset it.
                </p>
                <button
                  onClick={handleCloseWelcomeModal}
                  className='bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition'
                >
                  Start My Day!
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
