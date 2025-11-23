import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';
import {
  getAnalytics,
  isSupported as analyticsSupported,
} from 'firebase/analytics';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDm5ivgv258DG0-JgSK3qBZ51niyQodANY',
  authDomain: 'azan-time-app.firebaseapp.com',
  databaseURL: 'https://azan-time-app-default-rtdb.firebaseio.com',
  projectId: 'azan-time-app',
  storageBucket: 'azan-time-app.firebasestorage.app',
  messagingSenderId: '933825769707',
  appId: '1:933825769707:web:316743ff5dbfc79a4a8eae',
  measurementId: 'G-CXCQ1341FE',
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Realtime Database
const db = getDatabase(app);

// ✅ Firestore
const firestore = getFirestore(app);

// ✅ Analytics (optional — only works in browser)
let analytics = null;
analyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// ✅ Firebase Cloud Messaging (FCM)
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

// 🔔 Request permission & get FCM token
export const requestPermissionAndGetToken = async () => {
  if (!messaging) {
    console.warn('Firebase messaging not supported on this browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        process.env.REACT_APP_FIREBASE_VAPID_KEY ||
        'BKk6LBM3AXV7yHGjbpCQDmSBKHNddRIP-mxAhTcLC9C16TA4TSw4rFXehp7ujD7rMCtuhjpNHwfKtw8YjSJfIWs',
    });

    if (token) {
      console.log('✅ FCM Token:', token);
      return token;
    } else {
      console.warn('❌ No FCM token retrieved.');
      return null;
    }
  } catch (err) {
    console.error('🔥 Error getting FCM token:', err);
    return null;
  }
};

// 🧠 Save FCM token (supports logged-in or anonymous users)
export const saveFcmToken = async (emailOrAnon, token) => {
  if (!token) {
    console.warn('⚠️ Token missing, skipping save.');
    return;
  }

  try {
    const key = emailOrAnon
      ? emailOrAnon.replace(/\./g, '_').toLowerCase()
      : `anon_${Date.now()}`;

    await set(ref(db, `fcmTokens/${key}`), {
      token,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ FCM token saved for: ${key}`);
  } catch (err) {
    console.error('❌ Error saving FCM token:', err);
  }
};

// 📩 Foreground message listener
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);
      resolve(payload);
    });
  });

export {
  db,
  ref,
  set,
  onValue,
  firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  analytics,
  messaging,
};
