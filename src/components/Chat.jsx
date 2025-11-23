// src/components/ContactFormWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ref, push, serverTimestamp, onChildAdded } from 'firebase/database';
import { db } from '../firebase';
import { FaComments } from 'react-icons/fa';

export default function ContactFormWidget({ isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [notifications, setNotifications] = useState([]);
  const notificationAudio = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.comment.trim()) {
      alert('Please fill in the required fields');
      return;
    }

    try {
      await push(ref(db, 'submissions'), {
        ...formData,
        timestamp: serverTimestamp(),
      });

      // ✅ Notify Admin via API route
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `📩 New Message from ${formData.name}`,
          message: formData.comment,
        }),
      });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', comment: '' });
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  // 🔔 Admin listener for real-time Firebase notifications
  useEffect(() => {
    if (!isAdmin) return;

    const submissionsRef = ref(db, 'submissions');
    const unsubscribe = onChildAdded(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      setNotifications((prev) => [data, ...prev]);

      // Play local sound
      notificationAudio.current
        .play()
        .catch((err) => console.log('Audio error:', err));

      // Browser popup
      if (Notification.permission === 'granted') {
        new Notification('💬 New Submission', {
          body: `${data.name}: ${data.comment}`,
          icon: '/ding.png',
        });
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const toggleForm = () => {
    setIsOpen(!isOpen);
    if (isSubmitted) setIsSubmitted(false);
  };

  return (
    <>
      {/* 💬 Chat Icon */}
      <div
        className='fixed bottom-6 right-6 z-50 cursor-pointer'
        onClick={toggleForm}
      >
        <button className='p-4 rounded-full shadow-lg text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:scale-105 transform transition duration-300'>
          <FaComments size={24} />
        </button>
      </div>

      {/* 📩 Form Panel */}
      {isOpen && (
        <div className='fixed bottom-24 right-6 w-80 bg-white shadow-lg rounded-xl flex flex-col z-50'>
          <div className='flex justify-between items-center p-3 text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-t-xl'>
            <h3 className='font-bold'>Contact Us</h3>
            <button
              onClick={() => setIsOpen(false)}
              className='text-white font-bold'
            >
              ✕
            </button>
          </div>

          <div className='p-4'>
            {/* 🧾 Friendly welcome message */}
            <div className='mb-4 bg-gray-100 p-3 rounded-md text-sm text-gray-700'>
              💬 <b>Thanks for contacting us!</b>
              <br />
              Please submit any <b>bug report</b> or <b>request a demo</b> for
              educators or your organization.
            </div>

            {isSubmitted ? (
              <div className='text-center py-8'>
                <h4 className='font-bold text-lg text-gray-800'>Thank You!</h4>
                <p className='text-gray-600 mt-2'>
                  Your message has been successfully received.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Name
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Comment
                  </label>
                  <textarea
                    name='comment'
                    rows='4'
                    value={formData.comment}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500'
                    required
                  ></textarea>
                </div>
                <button
                  type='submit'
                  className='w-full px-4 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition duration-300'
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🧠 Admin Popup Messages */}
      {isAdmin && notifications.length > 0 && (
        <div className='fixed top-6 right-6 w-64 bg-white shadow-lg rounded-lg p-4 z-50'>
          {notifications.map((note, idx) => (
            <div key={idx} className='mb-2 p-2 border-b last:border-b-0'>
              <p className='font-bold text-sm'>{note.name || 'Anonymous'}</p>
              <p className='text-xs text-gray-600'>{note.comment}</p>
            </div>
          ))}
        </div>
      )}

      <audio ref={notificationAudio} src='/ding.mp3' preload='auto' />
    </>
  );
}
