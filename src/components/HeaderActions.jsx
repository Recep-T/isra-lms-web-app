import React from 'react';
import { FaKaaba } from 'react-icons/fa';

// ✅ Inline SVG icons
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

const HiArrowPath = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M12 5V2.25a.75.75 0 011.5 0V5a.75.75 0 01-.75.75h-3A.75.75 0 019 5V2.25a.75.75 0 011.5 0V5h1.5zM4.5 12a7.5 7.5 0 1115 0 .75.75 0 01-1.5 0 6 6 0 10-12 0 .75.75 0 01-1.5 0z'
      clipRule='evenodd'
    />
  </svg>
);

const HiCog = (props) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='currentColor'
  >
    <path
      fillRule='evenodd'
      d='M11.983 1.318a.75.75 0 00-1.466 0l-.358 1.432a7.003 7.003 0 00-1.318.761l-1.34-.726a.75.75 0 00-.98.28l-.75 1.3a.75.75 0 00.28.98l1.14.616a7.07 7.07 0 000 2.104l-1.14.616a.75.75 0 00-.28.98l.75 1.3a.75.75 0 00.98.28l1.34-.726c.41.304.848.563 1.318.761l.358 1.432a.75.75 0 001.466 0l.358-1.432a7.003 7.003 0 001.318-.761l1.34.726a.75.75 0 00.98-.28l.75-1.3a.75.75 0 00-.28-.98l-1.14-.616a7.07 7.07 0 000-2.104l1.14-.616a.75.75 0 00.28-.98l-.75-1.3a.75.75 0 00-.98-.28l-1.34.726a7.003 7.003 0 00-1.318-.761l-.358-1.432zM10 13.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z'
      clipRule='evenodd'
    />
  </svg>
);

export default function HeaderActions({
  locationName,
  onResetLocation,
  onQiblaOpen,
  navigate,
  loading,
}) {
  return (
    <div className='w-full max-w-3xl mt-10 px-4 sm:px-0 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6'>
      {/* 🌍 Location info */}
      <div className='flex items-center gap-2 text-gray-700 font-medium bg-white px-5 py-3 rounded-xl shadow-md w-full sm:w-auto justify-center sm:justify-start'>
        <HiLocationMarker className='text-indigo-600 w-6 h-6' />
        <span className='truncate'>
          {locationName || 'Detecting location...'}
        </span>
      </div>

      {/* 🔘 Action Buttons */}
      <div className='flex flex-wrap justify-center sm:justify-end gap-3 w-full sm:w-auto'>
        {/* Reset Location */}
        <button
          onClick={onResetLocation}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 
          text-white font-semibold rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-300 
          ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <HiArrowPath className='w-5 h-5' />
          <span className='text-sm font-medium'>Reset Location</span>
        </button>

        {/* Prayer Times */}
        <button
          onClick={() => navigate('/prayer-times')}
          className='flex items-center justify-center gap-2 px-5 py-3 bg-white border border-indigo-500 
          text-indigo-600 font-semibold rounded-full shadow-md hover:bg-indigo-100 transition-all duration-300'
        >
          <HiCog className='w-5 h-5' />
          <span className='text-sm font-medium'>Prayer Times</span>
        </button>

        {/* Qibla Finder */}
        <button
          onClick={onQiblaOpen}
          className='flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
          text-white font-semibold rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-300'
        >
          <FaKaaba className='w-5 h-5 transform rotate-180' />
          <span className='hidden sm:inline text-sm font-medium'>
            Qibla Finder
          </span>
        </button>
      </div>
    </div>
  );
}
