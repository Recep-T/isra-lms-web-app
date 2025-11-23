import React from 'react';
import { HiClock } from './Icons';

export default function PrayerTable({
  timings,
  nextPrayer,
  prayerIcons,
  prayerOrder,
}) {
  return (
    <div className='w-full bg-white p-6 rounded-3xl shadow-md border border-gray-100'>
      <h3 className='text-2xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center'>
        <HiClock className='w-5 h-5 mr-2 text-indigo-500' />
        Today's Full Timings
      </h3>
      <div className='divide-y divide-gray-100'>
        {prayerOrder.map((name) => {
          if (!timings[name]) return null;
          const isNext = nextPrayer?.name === name;
          return (
            <div
              key={name}
              className={`flex justify-between items-center py-3 px-3 rounded-xl ${
                isNext
                  ? 'bg-indigo-50 font-semibold border border-indigo-100'
                  : ''
              }`}
            >
              <span className='flex items-center text-lg text-gray-700'>
                {prayerIcons[name]} <span className='ml-3'>{name}</span>
              </span>
              <span
                className={`text-xl font-mono ${isNext ? 'text-indigo-600' : 'text-gray-800'}`}
              >
                {timings[name]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
