import React, { useState, useEffect } from 'react';
// Harici paketin çözümlenememesi hatası nedeniyle react-icons/hi kaldırıldı ve yerine inline SVG bileşenleri kullanıldı.

// --- Inline SVG İkon Bileşenleri (react-icons/hi yerine) ---
const IconWrapper = ({
  children,
  className = 'w-6 h-6',
  title = '',
  strokeWidth = 1.5,
  stroke = 'currentColor',
}) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={strokeWidth}
    stroke={stroke}
    aria-hidden='true'
    title={title}
  >
    {children}
  </svg>
);

const SVGChevronRight = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M8.25 4.5l7.5 7.5-7.5 7.5'
    />
  </IconWrapper>
);

const SVGCheckCircle = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </IconWrapper>
);

const SVGRefresh = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181-3.181m0 0l-3.181-3.182'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.932 9.489l-3.286-3.286-3.287 3.286M17.25 16.5l-2.75-2.75-2.75 2.75M12 21A9 9 0 1012 3a9 9 0 000 18z'
    />
  </IconWrapper>
);

const SVGHeart = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.593 1.056-4.312 2.68-1.783-1.624-3.57-2.68-5.368-2.68C4.09 3.75 2 5.765 2 8.25c0 7.22 9 12 10 12s10-4.78 10-12z'
    />
  </IconWrapper>
);

const SVGLightBulb = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 18h.01M12 12V3a1 1 0 00-1-1H7a1 1 0 00-1 1v9a1 1 0 001 1h4a1 1 0 001-1zm3 0v.01M17 12V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v9a1 1 0 001 1h4a1 1 0 001-1zM4 22h16'
    />
  </IconWrapper>
);

const SVGClock = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 6v6m0 0l-3-3m3 3h3M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </IconWrapper>
);

const SVGMinusCircle = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </IconWrapper>
);

const SVGPlusCircle = (props) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </IconWrapper>
);
// --- SVG İkon Tanımları Sonu ---

// --- İLK VERİ TANIMI ---
const initialTrackerItems = [
  {
    id: 1,
    name: 'Salawat (Daily)',
    icon: <SVGHeart className='w-6 h-6 text-red-500' />,
    goal: 100,
    current: 0,
    isCompleted: false,
    unit: 'times',
    description:
      'Recite Salawat (Durood) at least 100 times to remember the Prophet (PBUH).',
  },
  {
    id: 2,
    name: 'Qada Prayer (Make-up)',
    icon: <SVGClock className='w-6 h-6 text-blue-500' />,
    goal: 1,
    current: 0,
    isCompleted: false,
    unit: 'prayer',
    description: 'Perform at least 1 missed (Qada) prayer.',
  },
  {
    id: 3,
    name: 'Istighfar (Repentance)',
    icon: <SVGRefresh className='w-6 h-6 text-green-500' />,
    goal: 70,
    current: 0,
    isCompleted: false,
    unit: 'times',
    description: 'Say Istighfar (Astaghfirullah) at least 70 times a day.',
  },
  {
    id: 4,
    name: 'Morning/Evening Adhkar',
    icon: <SVGLightBulb className='w-6 h-6 text-yellow-500' />,
    goal: 1,
    current: 0,
    isCompleted: false,
    unit: 'completed',
    description: "Don't forget to read your morning or evening supplications.",
  },
];

// İkonları ID'ye göre hızlıca bulmak için Map oluşturma
const iconMap = initialTrackerItems.reduce((acc, item) => {
  acc[item.id] = item.icon;
  return acc;
}, {});

// Helper: Loads data from LocalStorage and manages daily reset
const loadTrackerData = () => {
  try {
    const serializedData = localStorage.getItem('dailyTrackerData');
    if (serializedData === null) {
      return null;
    }
    const data = JSON.parse(serializedData);

    const lastUpdateDate = data.lastUpdate
      ? new Date(data.lastUpdate).toDateString()
      : null;
    const todayDate = new Date().toDateString();

    let itemsToProcess = data.items;

    if (lastUpdateDate !== todayDate) {
      // Reset: current ve completion durumunu sıfırla
      itemsToProcess = data.items.map((item) => ({
        ...item,
        current: 0,
        isCompleted: false,
      }));
    }

    // localStorage'dan yüklenen veriye doğru JSX ikonunu tekrar ata
    const rehydratedItems = itemsToProcess.map((item) => ({
      ...item,
      // İkonu initialTrackerItems'tan (doğru JSX elementini içeren) ID'ye göre al
      icon: iconMap[item.id] || item.icon,
      description:
        initialTrackerItems.find((i) => i.id === item.id)?.description ||
        item.description,
      name:
        initialTrackerItems.find((i) => i.id === item.id)?.name || item.name,
      unit:
        initialTrackerItems.find((i) => i.id === item.id)?.unit || item.unit,
    }));

    return rehydratedItems;
  } catch (e) {
    console.error(
      'Could not load tracker data from localStorage. Resetting to initial data.',
      e,
    );
    return null;
  }
};

// Helper: Saves data to LocalStorage
const saveTrackerData = (items) => {
  // İkonlar JSON'a dönüştürülemeyeceği için, kaydetmeden önce sadece gerekli verileri içeren bir kopya oluştur
  const savableItems = items.map(({ icon, ...rest }) => rest);

  const dataToSave = {
    items: savableItems,
    lastUpdate: new Date().toISOString(),
  };
  localStorage.setItem('dailyTrackerData', JSON.stringify(dataToSave));
};

const DailyTrackerItem = ({ item, updateProgress }) => {
  const progress = Math.min(100, (item.current / item.goal) * 100);
  // Hedefi 1 olan öğeler (Qada, Adhkar) ikili (binary) kabul edilir
  const isBinaryGoal = item.goal === 1;

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow transition duration-300 ${item.isCompleted ? 'ring-2 ring-green-400 opacity-90' : 'hover:shadow-lg'}`}
    >
      <div className='flex justify-between items-center mb-2'>
        <div className='flex items-center space-x-3'>
          {item.icon}
          <h4 className='text-lg font-bold text-gray-800'>{item.name}</h4>
          {item.isCompleted && (
            <SVGCheckCircle
              className='w-5 h-5 text-green-500'
              title='Completed'
            />
          )}
        </div>
      </div>

      <p className='text-xs text-gray-500 mt-1 mb-3'>{item.description}</p>

      {/* Progress Bar */}
      <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
        <div
          className='h-2.5 rounded-full bg-indigo-600 transition-all duration-500'
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className='flex justify-between items-center text-sm text-gray-600 font-medium'>
        <span>
          Goal: {item.goal} {item.unit}
        </span>
        <span
          className={`${item.isCompleted ? 'text-green-600' : 'text-indigo-600'}`}
        >
          {item.current} / {item.goal} {item.unit}
        </span>
      </div>

      {/* Controls */}
      <div className='mt-3 flex justify-end space-x-2'>
        {/* Count-based increment/decrement (Salawat, Istighfar) */}
        {!isBinaryGoal && (
          <>
            <button
              onClick={() => updateProgress(item.id, -10)}
              className='p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50'
              disabled={item.current < 10}
              title='Decrement by 10'
            >
              <SVGMinusCircle className='w-6 h-6' />
            </button>
            <button
              onClick={() => updateProgress(item.id, 1)}
              className='p-1 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition disabled:opacity-50'
              disabled={item.isCompleted}
              title='Increment by 1'
            >
              <SVGPlusCircle className='w-6 h-6' />
            </button>
          </>
        )}

        {/* Binary complete/reset button (Qada Prayer, Adhkar) */}
        {isBinaryGoal && (
          <button
            // HATA DÜZELTİLDİ: Reset durumunda (isCompleted true),
            // current değerini 0'a çekmek için -item.current gönderilir.
            // Complete durumunda ise 1 gönderilir.
            onClick={() =>
              updateProgress(item.id, item.isCompleted ? -item.current : 1)
            }
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              item.isCompleted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title={item.isCompleted ? 'Reset completion' : 'Mark as complete'}
          >
            {item.isCompleted ? 'Reset' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function DailyTracker() {
  const [trackerItems, setTrackerItems] = useState(
    () => loadTrackerData() || initialTrackerItems,
  );

  // LocalStorage'a kaydetme efekti
  useEffect(() => {
    saveTrackerData(trackerItems);
  }, [trackerItems]);

  const updateProgress = (id, change) => {
    setTrackerItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          let newCurrent = item.current + change;
          // Sayacın 0'ın altına düşmesini engeller. Reset için -item.current gönderildiğinde
          // newCurrent 0 olacaktır (0 < 0 değil), bu yüzden bu satır çalışır durumdadır.
          if (newCurrent < 0) newCurrent = 0;

          const newIsCompleted = newCurrent >= item.goal;
          // Binary (1 hedefli) görevlerde 1'i geçmesini engeller
          if (item.goal === 1 && newCurrent > 1) newCurrent = 1;

          return {
            ...item,
            current: newCurrent,
            isCompleted: newIsCompleted,
          };
        }
        return item;
      }),
    );
  };

  const totalCompleted = trackerItems.filter((item) => item.isCompleted).length;
  const totalGoals = trackerItems.length;
  const overallProgress = Math.round((totalCompleted / totalGoals) * 100) || 0;

  return (
    <div className='w-full max-w-xl mx-auto px-4 mt-8'>
      <div className='bg-indigo-50 p-6 rounded-2xl shadow-lg border-t-8 border-indigo-600'>
        <h2 className='text-3xl font-extrabold text-indigo-800 flex items-center mb-2'>
          Daily Worship Tracker
        </h2>
        <p className='text-gray-600 mb-4'>
          Complete your daily duties and track your progress. Data resets
          automatically at the end of the day.
        </p>

        {/* Genel İlerleme Kartı */}
        <div className='bg-white p-4 rounded-lg shadow-md mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-lg font-semibold text-gray-700'>
              Overall Daily Goal Completion
            </span>
            <span className='text-2xl font-bold text-green-600'>
              {overallProgress}%
            </span>
          </div>
          <div className='w-full bg-gray-300 rounded-full h-2.5'>
            <div
              className='h-2.5 rounded-full bg-green-500 transition-all duration-700'
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className='text-sm text-gray-500 mt-2'>
            {totalCompleted} / {totalGoals} Tasks Completed
          </p>
        </div>

        <div className='space-y-4'>
          {trackerItems.map((item) => (
            <DailyTrackerItem
              key={item.id}
              item={item}
              updateProgress={updateProgress}
            />
          ))}
        </div>

        {/* Ayarlar veya Yeni Görev Ekleme Alanı */}
        <div className='mt-6 pt-4 border-t border-indigo-200'>
          <button className='w-full text-center text-indigo-600 font-medium hover:text-indigo-800 transition flex items-center justify-center'>
            Add New Task / Set Goals
            <SVGChevronRight className='w-5 h-5 ml-1' />
          </button>
        </div>
      </div>
    </div>
  );
}
