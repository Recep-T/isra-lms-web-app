import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaTimes } from 'react-icons/fa';

// --- Enhanced Content Data ---
const content = {
  tahajjud: {
    title: '🌙 Tahajjud (Late Night)',
    text: 'Wake in the quiet of the night, seek forgiveness, and pour your heart in sincere dua.',
    arabic: 'صلاة التهجد',
    transliteration: 'Salat al-Tahajjud',
    meaning:
      'The voluntary late-night prayer, known for its deep spiritual rewards.',
  },
  fajr: {
    title: '🌅 Fajr (Dawn)',
    text: 'Begin your day in light and peace. Pray with focus and let gratitude guide you.',
    arabic: 'صلاة الفجر',
    transliteration: 'Salat al-Fajr',
    meaning: 'The compulsory dawn prayer, marking the start of the day.',
  },
  travel: {
    title: '🚗 Travel Dua',
    text: "Recite the journey prayer: 'Subhana alladhi sakhkhara lana hadha...' for safe travel and guidance.",
    arabic: 'دُعَاءُ السَّفَرِ',
    transliteration: 'Subhana alladhi sakhkhara lana hadha...',
    meaning: 'A supplication recited before embarking on a journey.',
  },
  work: {
    title: '💼 Start of Work',
    text: "Say 'Rabbi yassir wala tu’assir' — May Allah make your tasks easy and fruitful today.",
    arabic: 'رَبِّ يَسِّرْ وَلَا تُعَسِّرْ',
    transliteration: "Rabbi yassir wa la tu'assir",
    meaning: 'O Lord, make it easy and do not make it difficult.',
  },
  duha: {
    title: '🌤 Duha Prayer',
    text: 'Pray for provision, productivity, and blessings in your day — a prayer of light and energy.',
    arabic: 'صلاة الضحى',
    transliteration: 'Salat al-Duha',
    meaning: 'The voluntary mid-morning prayer, also known as Awwabin.',
  },
  dhuhr: {
    title: '☀️ Dhuhr (Noon)',
    text: 'Take a pause to reconnect with your purpose. Refocus and find peace in prayer.',
    arabic: 'صلاة الظهر',
    transliteration: 'Salat al-Dhuhr',
    meaning: 'The compulsory noon prayer.',
  },
  asr: {
    title: '🌇 Asr (Afternoon)',
    text: 'Balance work with reflection. Pray for patience, endurance, and clarity.',
    arabic: 'صلاة العصر',
    transliteration: 'Salat al-Asr',
    meaning: 'The compulsory late-afternoon prayer.',
  },
  maghrib: {
    title: '🌆 Maghrib (Evening)',
    text: 'As the sun sets, give thanks and rest your heart in the remembrance of Allah.',
    arabic: 'صلاة المغرب',
    transliteration: 'Salat al-Maghrib',
    meaning: 'The compulsory sunset prayer.',
  },
  evening_duas: {
    title: '🌙 Evening Duas',
    text: 'Recite evening adhkar for protection, gratitude, and peace before night falls.',
    arabic: 'أَذْكَارُ الْمَسَاءِ',
    transliteration: 'Adhkar al-Masaa',
    meaning: 'Supplications and remembrances recited in the evening.',
  },
  isha: {
    title: '🌌 Isha (Night)',
    text: 'End your day in peace. Pray, forgive, and rest with contentment in your heart.',
    arabic: 'صلاة العشاء',
    transliteration: 'Salat al-Isha',
    meaning: 'The compulsory night prayer, the last of the day.',
  },
};

export default function PrayerModal({
  prayerKey,
  prayerTime,
  onComplete,
  onClose,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const data = content[prayerKey] || {
    title: '✨ Reflection Time',
    text: 'Take a moment to reflect and reconnect spiritually.',
    arabic: '',
    transliteration: '',
    meaning: '',
  };

  return (
    <motion.div
      className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className='bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-5 relative overflow-hidden transform transition-all duration-300'
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-red-500 transition'
        >
          <FaTimes size={20} />
        </button>

        <div className='text-center space-y-1 border-b pb-4 border-yellow-100'>
          <h3 className='text-2xl font-extrabold text-yellow-600 dark:text-yellow-400'>
            {data.title}
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 font-mono italic'>
            ⏰ Scheduled: {prayerTime}
          </p>
        </div>

        <p className='text-gray-700 dark:text-gray-300 leading-relaxed text-base italic'>
          {data.text}
        </p>

        {/* Arabic & Details Toggle */}
        <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
          <h4 className='text-lg font-semibold text-yellow-700 dark:text-yellow-500 flex items-center gap-2'>
            <FaBookOpen />
            Deeper Reflection
          </h4>
          <label className='flex items-center cursor-pointer'>
            <div className='relative'>
              <input
                type='checkbox'
                className='sr-only'
                checked={showDetails}
                onChange={() => setShowDetails(!showDetails)}
              />
              <div
                className={`block ${showDetails ? 'bg-yellow-500' : 'bg-gray-300'} w-14 h-8 rounded-full transition`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showDetails ? 'translate-x-6' : 'translate-x-0'}`}
              ></div>
            </div>
          </label>
        </div>

        {/* Hidden Details Content */}
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-4 pt-3 border-t border-yellow-200 dark:border-yellow-700 overflow-hidden'
          >
            {/* Arabic */}
            <div className='p-3 bg-yellow-50 dark:bg-gray-700 rounded-lg shadow-inner'>
              <p
                className='text-3xl font-arabic text-center text-gray-800 dark:text-white'
                dir='rtl'
              >
                {data.arabic}
              </p>
            </div>

            {/* Turkish Latin Transliteration */}
            <div>
              <p className='text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1'>
                Turkce Latin Ile Yazilisi:
              </p>
              <p className='text-lg font-mono text-gray-700 dark:text-gray-200 p-2 bg-gray-100 dark:bg-gray-600 rounded-md'>
                {data.transliteration}
              </p>
            </div>

            {/* Meaning */}
            <div>
              <p className='text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1'>
                Anlami (Meaning):
              </p>
              <p className='text-base text-gray-600 dark:text-gray-300 italic p-2 bg-gray-100 dark:bg-gray-600 rounded-md'>
                {data.meaning}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className='flex justify-center pt-4 border-t border-gray-100 dark:border-gray-700'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete(prayerKey)}
            className='flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:rotate-1'
          >
            Mark as Done ✅
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
