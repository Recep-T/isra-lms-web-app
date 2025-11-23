// src/pages/AdminDashboard.jsx
import { useEffect } from 'react';
import {
  db,
  ref,
  set,
  requestPermissionAndGetToken,
  onMessageListener,
} from '../firebase';

export default function AdminDashboard() {
  useEffect(() => {
    // 1️⃣ Request permission and save device token
    requestPermissionAndGetToken().then((token) => {
      if (token) {
        // Save token in Realtime DB
        set(ref(db, 'adminToken'), token);
      }
    });

    // 2️⃣ Listen for notifications while app is open
    onMessageListener().then((payload) => {
      console.log('Push notification received:', payload);
      // Play sound when notification arrives
      const audio = new Audio('/ding.mp3');
      audio.play();
    });
  }, []);

  return <h1>Admin Dashboard</h1>;
}
