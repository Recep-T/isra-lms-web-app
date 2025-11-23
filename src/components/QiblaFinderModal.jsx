import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaKaaba, FaTimes, FaCompass, FaLocationArrow } from 'react-icons/fa';

// Fixed Component Name for better clarity
export default function QiblaFinderModal({ isOpen, onClose }) {
  // Use null as initial state for heading to show loading/error status
  const [heading, setHeading] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  // const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [showDesktopMessage, setShowDesktopMessage] = useState(false);
  const [isIOSPermissionNeeded, setIsIOSPermissionNeeded] = useState(false);

  // Constants
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;

  // 🕋 Calculate Qibla bearing
  const calculateQiblaDirection = useCallback((lat, lon) => {
    const latRad = (Math.PI / 180) * lat;
    const lonRad = (Math.PI / 180) * lon;
    const kaabaLatRad = (Math.PI / 180) * KAABA_LAT;
    const kaabaLonRad = (Math.PI / 180) * KAABA_LON;
    const deltaLon = kaabaLonRad - lonRad;

    const y = Math.sin(deltaLon) * Math.cos(kaabaLatRad);
    const x =
      Math.cos(latRad) * Math.sin(kaabaLatRad) -
      Math.sin(latRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLon);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    // Ensure bearing is between 0 and 360 degrees
    bearing = (bearing + 360) % 360;
    return bearing;
  }, []); // dependency array is empty since constants are outside

  // 🌍 Get location
  useEffect(() => {
    if (!isOpen) {
      // setCoords(null);
      setQiblaDirection(null);
      setError('');
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // setCoords({ latitude, longitude });
          const bearing = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(bearing);
          setError(''); // Clear previous errors
        },
        (err) => {
          console.error('Geolocation Error:', err);
          setError(
            'Could not get your location. Please enable location access.',
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    } else {
      setError('Geolocation is not supported on this device.');
    }
  }, [isOpen, calculateQiblaDirection]); // Added calculateQiblaDirection as dependency (though useCallback prevents re-creation)

  // 🧭 Permission and Compass Listener (mobile)
  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const requestIOSPermissions = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState =
          await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setIsIOSPermissionNeeded(false);
          // Now proceed to add listeners
          startCompassListener();
        } else {
          setError('iOS requires motion sensor permission for the compass.');
        }
      } catch (err) {
        setError('Error requesting motion sensor permission.');
        console.error('Permission request error:', err);
      }
    } else {
      // For non-iOS or older iOS, just start listening
      startCompassListener();
    }
  };

  const startCompassListener = () => {
    const handleOrientation = (event) => {
      let alpha = null;

      if (event.webkitCompassHeading !== undefined) {
        // Fallback for older iOS Safari (gives heading relative to true north)
        alpha = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // For Android, usually the "absolute" event is better
        alpha = event.alpha;
      }

      if (typeof alpha === 'number') {
        // We use alpha (which is usually magnetic) and normalize it to 0-360
        // We do NOT subtract declination here; we treat it as a magnetic compass
        setHeading(360 - alpha);
      }
    };

    // Listen for both types for compatibility
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation,
      );
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  useEffect(() => {
    if (!isOpen) return;

    // Check if permission is needed for iOS
    if (
      isIOS() &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            const cleanup = startCompassListener();
            return cleanup;
          } else if (permissionState === 'denied') {
            setError('iOS requires motion sensor permission for the compass.');
          } else {
            // Permission needed on user interaction
            setIsIOSPermissionNeeded(true);
          }
        })
        .catch((err) => {
          // Browser may not support it or other error
          const cleanup = startCompassListener();
          return cleanup;
        });
    } else {
      // For Android and other browsers, just start listening
      const cleanup = startCompassListener();
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine the rotation angle for the Qibla arrow
  // Qibla direction is True North (0 degrees North)
  // Heading is what the device is facing (relative to True/Magnetic North, depending on implementation)
  // We rotate the COMPASS background by -heading to align it with North.
  // We rotate the KAABA icon by (qiblaDirection - heading) to point it relative to the compass and the device.
  const kaabaRotation = qiblaDirection !== null ? qiblaDirection - heading : 0;
  const compassRotation = heading !== null ? -heading : 0;

  // Status Message
  const statusMessage = error
    ? `Error: ${error}`
    : heading === null
      ? 'Loading Compass...'
      : qiblaDirection === null
        ? 'Finding your location...'
        : isIOSPermissionNeeded
          ? 'Tap the button below to enable the compass.'
          : `Qibla Direction: ${qiblaDirection.toFixed(1)}° True North`;

  return (
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='bg-gradient-to-b from-white to-indigo-50 rounded-3xl shadow-xl w-[90%] max-w-md p-6 relative border border-indigo-100'
      >
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-800'
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <h2 className='text-2xl font-bold text-center text-indigo-700 mb-1'>
          Qibla Finder
        </h2>
        <p className='text-center text-sm text-gray-500 mb-5'>
          Point your device towards **
          {qiblaDirection !== null ? `${qiblaDirection.toFixed(1)}°` : '...'}**
          🕋
        </p>

        {/* 🧭 Compass Container */}
        <div className='relative flex flex-col items-center justify-center'>
          {/* Compass Circle */}
          <motion.div
            animate={{ rotate: compassRotation }}
            transition={{ type: 'spring', stiffness: 80 }}
            className='w-48 h-48 rounded-full border-8 border-indigo-200 bg-white flex items-center justify-center shadow-inner'
          >
            {/* North Indicator */}
            <div className='absolute top-1 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-bold'>
              N
            </div>
            {/* Qibla Direction Arrow */}
            {qiblaDirection !== null && heading !== null && (
              <motion.div
                // Rotate the Kaaba icon to its correct position relative to the device's heading
                animate={{ rotate: kaabaRotation }}
                transition={{ type: 'spring', stiffness: 80 }}
                className='absolute top-0 transform origin-bottom'
                style={{
                  // Position the icon on the perimeter of the compass face (e.g., 20px offset from center)
                  transform: `rotate(${kaabaRotation}deg) translateY(-85px)`,
                }}
              >
                <FaKaaba className='text-pink-600 drop-shadow-md' size={24} />
              </motion.div>
            )}

            {/* Device Facing Indicator (A fixed icon that always points up on the screen) */}
            <div
              className='absolute bottom-0 text-indigo-500'
              style={{ transform: 'translateY(12px) rotate(180deg)' }}
            >
              <FaLocationArrow size={24} />
            </div>
          </motion.div>

          {/* Status/Error */}
          <p
            className={`mt-4 text-center text-sm font-semibold ${error ? 'text-red-500' : 'text-indigo-600'}`}
          >
            {statusMessage}
          </p>

          {/* iOS Permission Button */}
          {isIOSPermissionNeeded && (
            <button
              onClick={requestIOSPermissions}
              className='mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors'
            >
              Enable Compass (iOS)
            </button>
          )}
        </div>

        {/* 🌐 Google Qibla Finder Button */}

        {/* 🌐 Google Qibla Finder Button */}
        <div className='flex flex-col items-center gap-3 mt-5'>
          <button
            onClick={() => {
              // The logs are correctly placed here and should execute on click.

              const userAgent = navigator.userAgent;
              console.log('User Agent String:', userAgent);

              const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
              console.log('Is Mobile Device:', isMobile);

              const qiblaUrl =
                'https://qiblafinder.withgoogle.com/intl/en/onboarding';

              if (isMobile) {
                console.log('Opening Qibla Finder URL (Mobile):', qiblaUrl);
                // This line opens a new tab and keeps the current modal open briefly
                window.open(qiblaUrl, '_blank', 'noopener,noreferrer');

                // You might need to close the modal here if you want:
                // onClose();
              } else {
                console.log(
                  'Displaying Desktop Message. Target URL:',
                  qiblaUrl,
                );
                setShowDesktopMessage(true);
              }
            }}
            className='flex items-center gap-2 px-5 py-2 
               bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
               text-white rounded-full font-semibold shadow-md 
               hover:scale-105 hover:shadow-lg transition-transform duration-300' // <--- CSS classes added here
          >
            <FaCompass className='text-lg' />
            Open Google Qibla Finder
          </button>
        </div>

        {/* 🖥️ Desktop Message Modal (Your original logic is fine here) */}
        {showDesktopMessage && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]'>
            <div className='bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl border border-indigo-200'>
              <h3 className='text-lg font-bold text-indigo-600 mb-2 text-center'>
                Works Best on Mobile 📱
              </h3>
              <p className='text-sm text-gray-700 text-center mb-4'>
                Google Qibla Finder requires mobile sensors (GPS & camera).
                Please open the link below on your phone’s browser:
              </p>
              <a
                href='https://qiblafinder.withgoogle.com/intl/en/onboarding'
                target='_blank'
                rel='noopener noreferrer'
                className='block text-center font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 rounded-full hover:scale-105 transition'
              >
                Open qiblafinder.withgoogle.com
              </a>
              <button
                onClick={() => setShowDesktopMessage(false)}
                className='mt-4 block mx-auto text-sm text-gray-600 hover:text-gray-900 underline'
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className='mt-6 flex justify-center'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold shadow-md hover:scale-105 transition'
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
