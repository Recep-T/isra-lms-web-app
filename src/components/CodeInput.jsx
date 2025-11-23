/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get, remove } from 'firebase/database';
import { getRoleFromCode, emailToKey } from '../utils/roleCodes';

export default function CodeInput() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // 🧠 LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setUserNotFound(false);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!code.trim()) {
      setError('Access code is required.');
      return;
    }

    try {
      const emailKey = emailToKey(email);
      const userRef = ref(db, `users/${emailKey}`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.val();
        let role = userData.role;

        const detectedRole = getRoleFromCode(code);
        if (detectedRole) role = detectedRole;

        if (!role) {
          setError('Invalid access code.');
          return;
        }

        if (role === 'admin') {
          navigate('/admin', { state: { currentUserId: emailKey, role } });
        } else if (role === 'educator') {
          navigate(`/educator-dashboard/${emailKey}`, {
            state: { currentUserId: emailKey, role },
          });
        } else {
          navigate(`/sura-dashboard/${emailKey}`, {
            state: { currentUserId: emailKey, role: role || 'student' },
          });
        }
      } else {
        setUserNotFound(true);
        setError('Email not found. Please sign up first.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    }
  };

  // 🗑️ DELETE HANDLER (with validation)
  const handleDeleteAccount = async () => {
    if (!deleteEmail.trim()) {
      setDeleteStatus('Please enter your email before deleting your account.');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ Are you sure you want to permanently delete your account and all data? This cannot be undone.',
    );
    if (!confirmed) return;

    try {
      const emailKey = emailToKey(deleteEmail);
      const userRef = ref(db, `users/${emailKey}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        setDeleteStatus('❌ No account found for this email.');
        return;
      }

      await remove(userRef);
      setDeleteStatus('✅ Your account has been permanently deleted.');
      setDeleteEmail('');
      setEmail('');
      setCode('');
      setError('');
      setUserNotFound(false);

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setDeleteStatus('❌ Failed to delete account. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4'>
      <form
        onSubmit={handleLogin}
        className='w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6'
      >
        <h2 className='text-3xl font-extrabold text-center text-indigo-700 mb-4'>
          Login
        </h2>

        {/* Email & Code Inputs */}
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          className='w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
        />

        <input
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value.toLowerCase())}
          placeholder='Access Code (abcde)'
          className='w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
        />

        {error && <p className='text-red-600 text-center text-sm'>{error}</p>}

        <button
          type='submit'
          className='w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold'
        >
          Login
        </button>

        {userNotFound && (
          <button
            type='button'
            onClick={() =>
              navigate(`/register/${code || 'abcde'}`, { state: { email } })
            }
            className='w-full bg-yellow-400 text-gray-900 py-3 rounded-lg mt-2 hover:bg-yellow-300 transition font-semibold'
          >
            Sign Up
          </button>
        )}

        {/* 🧩 Account Deletion Section */}
        <div className='mt-8 border-t pt-4'>
          {!showDeleteInput ? (
            <button
              type='button'
              onClick={() => setShowDeleteInput(true)}
              className='w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold'
            >
              Delete My Account
            </button>
          ) : (
            <div className='space-y-3'>
              <input
                type='email'
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder='Enter your registered email'
                className='w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500'
              />

              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleDeleteAccount}
                  className='w-1/2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold'
                >
                  Confirm Delete
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowDeleteInput(false);
                    setDeleteStatus('');
                  }}
                  className='w-1/2 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-semibold'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteStatus && (
            <p
              className={`text-center text-sm mt-3 ${
                deleteStatus.includes('✅')
                  ? 'text-green-600'
                  : deleteStatus.includes('❌')
                    ? 'text-red-600'
                    : 'text-gray-700'
              }`}
            >
              {deleteStatus}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
