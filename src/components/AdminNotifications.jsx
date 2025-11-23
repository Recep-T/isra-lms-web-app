// src/components/AdminNotifications.jsx
import React, { useEffect, useRef, useState } from 'react';
import { ref, onChildAdded } from 'firebase/database';
import { db } from '../firebase';

export default function AdminNotifications() {
  const notificationAudio = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return; // Wait until admin enables notifications

    const submissionsRef = ref(db, 'submissions');

    const unsubscribe = onChildAdded(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('New submission:', data);

      // Play sound
      notificationAudio.current
        .play()
        .catch((err) => console.log('Audio error:', err));
    });

    return () => unsubscribe();
  }, [enabled]);

  return (
    <div>
      <button
        onClick={() => setEnabled(true)}
        className='px-4 py-2 rounded bg-blue-500 text-white mb-2'
        disabled={enabled}
      >
        {enabled ? 'Notifications Enabled' : 'Enable Notifications'}
      </button>
      <audio ref={notificationAudio} src='/ding.mp3' preload='auto' />
    </div>
  );
}
