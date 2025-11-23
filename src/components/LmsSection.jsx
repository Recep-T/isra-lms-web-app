// src/components/IntroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LmsSection() {
  const navigate = useNavigate();

  return (
    <section className='text-center py-12 bg-indigo-50 rounded-xl shadow-lg'>
      <h2 className='text-5xl font-extrabold mb-4 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-lg'>
        ISRA Learning Management System
      </h2>

      <p className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-light'>
        Track your individual progress and manage your group’s Halaqa/Team
        journey in one comprehensive platform.
      </p>

      <div className='mt-8 flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4'>
        <button
          onClick={() => navigate('/prayer-times')}
          className='w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition'
        >
          Check Prayer Times
        </button>

        <button
          onClick={() => navigate('/login')}
          className='w-full md:w-auto px-8 py-3 bg-white border border-indigo-500 text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-indigo-100 transition'
        >
          Check Your Progress
        </button>
      </div>
    </section>
  );
}
