import React, { useState, useEffect } from 'react';
import QUOTES from '../data/quotes';

// 🎨 Some pleasant gradient color sets
const GRADIENTS = [
  'from-indigo-100 via-purple-100 to-pink-100',
  'from-blue-100 via-cyan-100 to-green-100',
  'from-yellow-100 via-orange-100 to-red-100',
  'from-pink-100 via-fuchsia-100 to-purple-200',
  'from-emerald-100 via-teal-100 to-sky-100',
  'from-rose-100 via-pink-100 to-yellow-100',
];

export default function QuoteSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  // 🔁 Rotate quotes every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
        setBgIndex((prev) => (prev + 1) % GRADIENTS.length);
        setFade(true);
      }, 500);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = QUOTES[currentIndex];
  const currentGradient = GRADIENTS[bgIndex];

  return (
    <section
      className={`transition-all duration-700 ease-in-out py-10 px-4 max-w-6xl mx-auto rounded-3xl bg-gradient-to-br ${currentGradient}`}
    >
      {/* Quote Card */}
      <div
        className={`bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl border-t-4 border-indigo-500 transition-opacity duration-700 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Theme Tag */}
        <span className='inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-100 rounded-full mb-4'>
          {currentQuote.theme}
        </span>

        {/* Quote Text */}
        <p className='text-xl md:text-2xl italic text-gray-800 leading-relaxed font-serif'>
          "{currentQuote.text}"
        </p>

        {/* Source */}
        <p className='mt-6 text-right text-base font-medium text-gray-600 border-t pt-4'>
          {currentQuote.source}
        </p>
      </div>

      {/* 🕌 Prayer Times Section (below the quote) */}
      <div className='mt-12'>{/* <PrayerTimeLanding /> */}</div>
    </section>
  );
}
