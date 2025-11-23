import './App.css';
// import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import CodeInput from './components/CodeInput';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import PrayerTimeLanding from './components/PrayerTimeLanding';
import SuraDashboard from './components/SuraDashboard';
// import UpdatePrompt from './components/UpdatePrompt';
import EducatorDashboard from './components/EducatorDashboard';
import StudentDetail from './components/StudentDetail'; // ✅ new detailed student page

function AppContent({ registerSW }) {
  const location = useLocation();
  const currentUserId =
    location.state?.currentUserId ||
    localStorage.getItem('currentUserId') ||
    'guest';

  // const [swRegistration, setSwRegistration] = useState(null);

  // useEffect(() => {
  //   if (registerSW) registerSW(setSwRegistration);
  // }, [registerSW]);

  return (
    <>
      <Routes>
        {/* Layout-free pages */}
        <Route path='/prayer-times' element={<PrayerTimeLanding />} />
        <Route path='/sura-dashboard/:studentId' element={<SuraDashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />

        {/* Layout-based pages */}
        <Route element={<Layout currentUserId={currentUserId} />}>
          <Route path='/' element={null} />
          <Route path='/login' element={<CodeInput />} />
          <Route path='/register' element={<Navigate to='/register/abcde' />} />
          <Route path='/register/:code' element={<RegistrationForm />} />

          {/* ✅ Educator Dashboard Routes */}
          <Route
            path='/educator-dashboard/:emailKey'
            element={<EducatorDashboard />}
          />
          <Route
            path='/educator-dashboard/:emailKey/student/:studentId'
            element={<StudentDetail />}
          />
        </Route>
      </Routes>

      {/* <UpdatePrompt registration={swRegistration} /> */}
    </>
  );
}

export default function App({ registerSW }) {
  return (
    <Router>
      <AppContent registerSW={registerSW} />
    </Router>
  );
}
