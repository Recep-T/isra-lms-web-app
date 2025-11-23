import React from 'react';
import { formatTimeRemaining } from './helpers/prayerUtils';

export default function PrayerCard({
  locationName,
  timings,
  nextPrayer,
  timeRemainingMs,
}) {
  return (
    <section className='w-full max-w-md mx-auto bg-blue-700 text-white rounded-3xl shadow-2xl p-4 sm:p-6 mt-6 mb-8 relative overflow-hidden'>
      <div className='flex justify-between items-center mb-4 text-blue-100'>
        <h2 className='text-lg font-semibold tracking-wide'>{locationName}</h2>
        <div className='flex items-center space-x-2 text-sm'>
          <span>🌤</span>
          <span>9°C</span>
          <span>|</span>
          <span>Th 10/15</span>
        </div>
      </div>

      <h3 className='text-center text-2xl sm:text-3xl font-bold mb-1'>
        {nextPrayer?.name || 'Next Prayer'}
      </h3>
      <p className='text-center text-blue-100 text-sm mb-4 tracking-wide'>
        Time Remaining
      </p>

      <div className='text-center font-extrabold text-5xl sm:text-6xl tracking-widest mb-6 font-mono'>
        {formatTimeRemaining(timeRemainingMs)}
      </div>

      <div className='flex justify-between text-sm text-blue-100 mb-4'>
        <p>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
        <p>1 Jumada al-awwal 1447</p>
      </div>

      <div className='grid grid-cols-3 gap-y-3 text-center border-t border-blue-400 pt-4'>
        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
          <div key={p}>
            <p
              className={`text-blue-200 text-xs uppercase tracking-wide ${
                p === nextPrayer?.name ? 'text-yellow-300' : ''
              }`}
            >
              {p}
            </p>
            <p className='text-white text-base font-semibold'>{timings?.[p]}</p>
          </div>
        ))}
      </div>

      <div className='absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-blue-700/10 pointer-events-none'></div>
    </section>
  );
}
