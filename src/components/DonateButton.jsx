// src/components/DonateButton.jsx
import React from 'react';
import { HiHeart } from 'react-icons/hi';

// Replace the URL below with your actual "Buy Me a Coffee" link
const DONATION_LINK = 'https://ko-fi.com/receptaylanhan';

export default function DonateButton() {
  return (
    <a
      href={DONATION_LINK}
      target='_blank'
      rel='noopener noreferrer'
      title='Support our volunteer team for a better user experience!'
      className='fixed bottom-4 right-4 z-50 
                 px-4 py-2 bg-indigo-600 text-white 
                 font-bold rounded-full shadow-lg 
                 hover:bg-indigo-700 transition 
                 flex items-center space-x-2 
                 transform hover:scale-105' // Changed color to indigo for better app integration
    >
      <HiHeart className='w-5 h-5 text-red-300' />
      <span>Support Our Team ✨</span>
    </a>
  );
}
