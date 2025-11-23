import React, { useState } from 'react';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase';

export default function DeleteAccount({ email }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState('');

  // Normalize Firebase key (same pattern as registration)
  const emailKey = email?.replace(/\./g, '_').toLowerCase();

  const handleDelete = async () => {
    if (!emailKey) {
      setStatus('Missing user email. Please log in again.');
      return;
    }

    try {
      await remove(ref(db, `users/${emailKey}`));
      setStatus('✅ Your account and all data have been permanently deleted.');
      setConfirmOpen(false);
      // optional: redirect home after short delay
      setTimeout(() => (window.location.href = '/'), 2500);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to delete account. Please try again.');
    }
  };

  return (
    <div className='mt-8 text-center'>
      {/* main button */}
      <button
        onClick={() => setConfirmOpen(true)}
        className='bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg shadow-md font-semibold transition'
      >
        Delete My Account
      </button>

      {/* confirmation modal */}
      {confirmOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md text-center space-y-5'>
            <h3 className='text-xl font-bold text-red-600'>
              Confirm Account Deletion
            </h3>
            <p className='text-gray-700'>
              This will permanently remove your account and all saved data. This
              action cannot be undone.
            </p>
            <div className='flex justify-center gap-4 mt-4'>
              <button
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className='bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* status message */}
      {status && <p className='mt-4 text-sm text-gray-700'>{status}</p>}
    </div>
  );
}
