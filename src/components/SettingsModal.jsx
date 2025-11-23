import React from 'react';
import { requestPermissionAndGetToken, saveFcmToken } from '../firebase';

export default function SettingsModal({
  isOpen,
  onClose,
  prefs,
  setPrefs,
  playSound,
  speak,
}) {
  if (!isOpen) return null;

  // Inline Close Icon
  const CloseIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
      className='w-6 h-6'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 18L18 6M6 6l12 12'
      />
    </svg>
  );

  // 🔔 Handle toggle for enabling notifications
  const handleReminderToggle = async (e) => {
    const enabled = e.target.checked;
    setPrefs((p) => ({ ...p, enabled }));

    if (enabled) {
      try {
        const token = await requestPermissionAndGetToken();
        if (token) {
          await saveFcmToken(null, token); // anonymous user
          console.log('✅ Notifications enabled & token saved');
          new Notification('✅ Notifications enabled', {
            body: 'Prayer reminders will be sent before each prayer time.',
          });
        } else {
          alert('❌ Could not enable notifications.');
        }
      } catch (err) {
        console.error('⚠️ Error enabling notifications:', err);
      }
    } else {
      console.log('🔕 Notifications disabled by user.');
    }
  };

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-fade-in'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <h2 className='text-2xl font-bold text-indigo-700 mb-4'>
          Notification Settings
        </h2>
        <p className='text-sm text-gray-500 mb-6'>
          Customize your prayer reminders, sounds, and voice notifications.
        </p>

        {/* Enable Toggle */}
        <div className='flex justify-between items-center mb-4'>
          <span className='font-medium text-gray-700'>Enable Reminders</span>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={prefs.enabled}
              onChange={handleReminderToggle}
            />
            <div className='w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 relative transition'>
              <div
                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition ${
                  prefs.enabled ? 'translate-x-5' : ''
                }`}
              />
            </div>
          </label>
        </div>

        {/* Reminder Time Dropdown */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-600 mb-1'>
            Reminder Time
          </label>
          <select
            className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400'
            value={prefs.minutesBefore}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              console.log(
                `⏰ Reminder time selected: ${newValue} minutes before prayer.`,
              );
              setPrefs((p) => ({ ...p, minutesBefore: newValue }));
            }}
          >
            <option value={30}>30 minutes before</option>
            <option value={45}>45 minutes before</option>
            <option value={60}>60 minutes before</option>
          </select>
        </div>

        {/* Sound & Voice Toggles */}
        <div className='flex flex-col sm:flex-row gap-3 mb-5'>
          {[
            { label: 'Sound', key: 'sound' },
            { label: 'Voice', key: 'voice' },
          ].map(({ label, key }) => (
            <label
              key={key}
              className='inline-flex items-center cursor-pointer'
            >
              <input
                type='checkbox'
                className='sr-only peer'
                checked={prefs[key]}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, [key]: e.target.checked }))
                }
              />
              <div className='w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 relative transition'>
                <div
                  className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition ${
                    prefs[key] ? 'translate-x-5' : ''
                  }`}
                />
              </div>
              <span className='ml-3 text-sm text-gray-700'>{label}</span>
            </label>
          ))}
        </div>

        {/* Test Buttons */}
        <div className='flex gap-3 justify-end flex-wrap'>
          <button
            onClick={playSound}
            className='px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100'
          >
            Test Sound
          </button>

          <button
            onClick={() => {
              if (prefs.voice && speak) {
                speak('This is a test of the voice reminder.');
              } else {
                alert('Voice Reminder is disabled in the settings.');
              }
            }}
            className='px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100'
          >
            Test Voice
          </button>

          <button
            onClick={() => {
              if ('Notification' in window) {
                if (Notification.permission === 'default') {
                  Notification.requestPermission().then((perm) => {
                    if (perm === 'granted')
                      new Notification('✅ Notifications enabled');
                  });
                } else if (Notification.permission === 'granted') {
                  new Notification('🔔 Test notification', {
                    body: 'Looks good!',
                  });
                }
              }
            }}
            className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg border hover:bg-gray-100'
          >
            Test Notification
          </button>
        </div>
      </div>
    </div>
  );
}
