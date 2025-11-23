import React, { useState, useEffect } from 'react';
import { HiMenu, HiX, HiArrowLeft, HiLocationMarker } from 'react-icons/hi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import QuoteSection from './QuoteSection';
import AnalogClock from './AnalogClock'; // Assume this is correctly imported
// import Chat from './Chat';
import PrayerTimeLanding from './PrayerTimeLanding';

// 💡 YENİ: currentUserId prop'u App.jsx'ten alınır
export default function Layout({ currentUserId = 'guest' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItemClass =
    'px-4 py-2 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition text-center';

  const isEducationDashboard = location.pathname.startsWith('/sura-dashboard');
  const isHome = location.pathname === '/';
  const isAuthenticated = currentUserId !== 'guest';
  const showBackButton =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register');

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-0Z0X0FHBRF', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  if (isEducationDashboard) {
    return (
      <div className='min-h-screen font-sans'>
        <Helmet>
          <title>Memorization Dashboard | ISRA</title>
          <meta name='robots' content='noindex, nofollow' />
        </Helmet>
        <Outlet />
      </div>
    );
  }

  // --- MAIN SIMPLIFIED LAYOUT (Default) ---
  return (
    <div className='min-h-screen flex flex-col bg-gray-50 font-sans'>
      <Helmet>
        <title>ISRA APP</title>
        <meta
          name='description'
          content='The essential Islamic education tool for children: track accurate prayer times and master Quran memorization (Hifz).'
        />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://www.yourdomain.com/' />
      </Helmet>

      {/* Header */}
      <header className='bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50'>
        {/* FIX: Removed 'hidden sm:block' from the clock container */}
        <div
          onClick={() => navigate('/')}
          className='flex items-center space-x-2 cursor-pointer'
        >
          {/* 🚀 FIX APPLIED HERE: Now visible on all screen sizes */}
          <div className='block'>
            <AnalogClock size={32} />
          </div>

          {/* Logo Text */}
          <h1
            className='text-2xl md:text-3xl font-extrabold 
bg-clip-text text-transparent bg-gradient-to-r 
from-yellow-500 via-orange-600 to-red-700' // <-- New Gradient
          >
            ISRA
          </h1>
        </div>

        {/* Desktop Navigation (Unchanged) */}
        <nav className='hidden md:flex space-x-4'>
          <button
            onClick={() => navigate('/prayer-times')}
            className='px-4 py-2 rounded-md font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition text-center flex items-center'
          >
            <HiLocationMarker className='w-5 h-5 mr-2 text-indigo-600' />
            Prayer Times
          </button>
          <button onClick={() => navigate('/login')} className={menuItemClass}>
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className={menuItemClass}
          >
            Register
          </button>
        </nav>

        {/* Mobile Hamburger Menu (Unchanged) */}
        <div className='md:hidden'>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <HiX className='w-6 h-6 text-gray-700' />
            ) : (
              <HiMenu className='w-6 h-6 text-gray-700' />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className='md:hidden fixed top-16 left-0 w-full bg-white shadow-xl z-50 flex flex-col space-y-3 px-6 py-4 border-t border-gray-100'
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <button
            onClick={() => {
              navigate('/prayer-times');
              setMenuOpen(false);
            }}
            className='px-4 py-3 rounded-lg font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition text-center flex items-center justify-center'
          >
            <HiLocationMarker className='w-5 h-5 mr-2 text-indigo-600' />
            Prayer Times
          </button>

          {isAuthenticated && (
            <button
              onClick={() => {
                navigate('/login');
                setMenuOpen(false);
              }}
              className={menuItemClass}
            >
              Memorization Panel
            </button>
          )}

          <button
            onClick={() => {
              navigate('/login');
              setMenuOpen(false);
            }}
            className={menuItemClass}
          >
            Login
          </button>
          <button
            onClick={() => {
              navigate('/register');
              setMenuOpen(false);
            }}
            className={menuItemClass}
          >
            Register
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className='flex-grow container mx-auto px-4 py-6 space-y-12'>
        {showBackButton && (
          <button
            onClick={() => navigate('/')}
            className='flex items-center text-indigo-600 font-medium mb-4'
          >
            <HiArrowLeft className='w-5 h-5 mr-2' />
            Back to Home
          </button>
        )}

        {isHome && (
          <>
            <PrayerTimeLanding />

            <QuoteSection />

            {/* 💡 GÜNCELLEME: currentUserId prop'u CommentSection'a iletiliyor */}
            {/* <CommentSection currentUserId={currentUserId} /> */}
          </>
        )}

        <Outlet />
      </main>

      {/* Footer */}
      <footer className='bg-blue-800 text-white py-4'>
        <div className='max-w-7xl mx-auto px-4 text-center space-y-3'>
          {/* Copyright */}
          <p className='text-sm md:text-base'>
            &copy; {new Date().getFullYear()} ISRA. All rights reserved.
          </p>

          {/* Support My Team Section */}
          <div className='flex flex-col md:flex-row justify-center items-center gap-2'>
            <span className='text-sm md:text-base'>
              ❤️ Support Us For Better Experience
            </span>
            <a
              href='https://ko-fi.com/receptaylanhan'
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full text-white font-semibold shadow-lg hover:scale-105 transform transition duration-300'
            >
              Donate
            </a>
          </div>
        </div>
      </footer>

      {/* Chat Floating Icon + Panel */}
      {/* 💡 GÜNCELLEME: Chat bileşenine de currentUserId prop'u iletiliyor */}
      {/* <Chat currentUserId={currentUserId} /> */}
    </div> // <-- closing div of layout
  );
}
