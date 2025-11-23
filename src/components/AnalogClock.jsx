// src/components/AnalogClock.jsx
import React, { useState, useEffect } from 'react';

/**
 * AnalogClock Component
 * Displays a simple, functional analog clock face with rotating hands.
 */
export default function AnalogClock({ size = 32 }) {
  // Varsayılan boyutu 32 olarak güncelledim
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate rotation degrees
  const hours = date.getHours() % 12; // 12-hour format
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // 360 degrees / 12 hours = 30 degrees/hour
  const hourDeg = hours * 30 + minutes * 0.5;

  // 360 degrees / 60 minutes = 6 degrees/minute
  const minuteDeg = minutes * 6 + seconds * 0.1;

  // 360 degrees / 60 seconds = 6 degrees/second
  const secondDeg = seconds * 6;

  return (
    <div
      className='relative rounded-full border-4 border-blue-600 shadow-md bg-white flex items-center justify-center'
      style={{ width: size, height: size }}
      title={date.toLocaleTimeString()} // Tooltip shows digital time
    >
      {/* Clock Center Dot */}
      <div className='absolute w-2 h-2 rounded-full bg-blue-700 z-30'></div>

      {/* Hour Hand */}
      <div
        className='absolute bg-blue-900 rounded-t-full transform origin-bottom'
        style={{
          height: `${size * 0.3}px`,
          width: '4px',
          transform: `rotate(${hourDeg}deg)`,
          transition: 'transform 0.5s cubic-bezier(.4, 2.3, .6, 1)',
          zIndex: 20,
          // El boyutunu küçülttük
          top: `${size * 0.2}px`,
        }}
      ></div>

      {/* Minute Hand */}
      <div
        className='absolute bg-blue-700 rounded-t-full transform origin-bottom'
        style={{
          height: `${size * 0.4}px`,
          width: '3px',
          transform: `rotate(${minuteDeg}deg)`,
          transition: 'transform 0.2s linear',
          zIndex: 10,
          // El boyutunu küçülttük
          top: `${size * 0.1}px`,
        }}
      ></div>

      {/* 🔴 Saniye İbresi DÜZELTİLDİ */}
      <div
        className='absolute bg-red-500 rounded-t-full transform origin-bottom'
        style={{
          // Height: Saniye ibresini biraz daha kısa yaptık (size * 0.45'ten size * 0.4'e)
          height: `${size * 0.4}px`,
          width: '2px',
          transform: `rotate(${secondDeg}deg)`,
          transition: 'transform 0.1s linear',
          zIndex: 5,
          // Top: İbreyi merkezden başlayacak şekilde yerleştirdik
          top: `${size * 0.1}px`,
        }}
      ></div>
    </div>
  );
}
