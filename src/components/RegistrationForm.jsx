import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { getRoleFromCode } from '../utils/roleCodes';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const params = useParams(); // allow prefilling code via route /register/:code
  const initialCode = params.code?.toLowerCase() || '';

  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    code: initialCode,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'First Name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.code.trim()) errs.code = 'Registration code is required';
    if (!getRoleFromCode(form.code)) errs.code = 'Invalid registration code';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const emailKey = form.email.replace(/\./g, '_').toLowerCase();
      const userRef = ref(db, `users/${emailKey}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setSubmitError('Email already registered. Please login.');
        setLoading(false);
        return;
      }

      const role = getRoleFromCode(form.code);
      await set(userRef, {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        role,
        createdAt: new Date().toISOString(),
      });

      if (role === 'educator') {
        await set(ref(db, `users/${emailKey}/students`), {}); // keep shape consistent
      }

      navigate('/login', { state: { email: form.email } });
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to register. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-lg bg-white shadow-xl rounded-xl p-8 space-y-6'
      >
        <h2 className='text-3xl font-extrabold text-center text-indigo-700 mb-4'>
          Registration Form
        </h2>

        {/* Registration Code Field with Live Hints */}
        <div className='relative'>
          <input
            name='code'
            value={form.code}
            onChange={(e) => {
              const val = e.target.value.toLowerCase(); // 👈 always lowercase
              handleChange({ target: { name: 'code', value: val } });

              if (val.startsWith('edu')) {
                setErrors((p) => ({
                  ...p,
                  codeHint: '🎓 educator code detected (edu123 or lead001)',
                }));
              } else if (val.startsWith('a') || val === 'abcde') {
                setErrors((p) => ({
                  ...p,
                  codeHint: '👩‍🎓 student code detected (abcde)',
                }));
              } else if (val.trim() === '') {
                setErrors((p) => ({ ...p, codeHint: '' }));
              } else {
                setErrors((p) => ({
                  ...p,
                  codeHint: 'ℹ️ Enter a valid code — abcde',
                }));
              }
            }}
            placeholder='Enter code (abcde)'
            className='w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
          />
          {/* Validation Error */}
          {errors.code && (
            <p className='text-red-600 text-xs mt-1'>{errors.code}</p>
          )}
          {/* Dynamic Hint */}
          {errors.codeHint && (
            <p
              className={`text-xs mt-2 transition-opacity duration-300 ease-in-out ${
                errors.codeHint.includes('educator')
                  ? 'text-blue-600'
                  : errors.codeHint.includes('student')
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}
            >
              {errors.codeHint}
            </p>
          )}
        </div>

        <input
          name='name'
          value={form.name}
          onChange={handleChange}
          placeholder='First Name'
          className='w-full rounded-lg border px-4 py-3'
        />
        {errors.name && <p className='text-red-600 text-xs'>{errors.name}</p>}

        <input
          name='lastName'
          value={form.lastName}
          onChange={handleChange}
          placeholder='Last Name'
          className='w-full rounded-lg border px-4 py-3'
        />
        {errors.lastName && (
          <p className='text-red-600 text-xs'>{errors.lastName}</p>
        )}

        <input
          name='email'
          value={form.email}
          onChange={handleChange}
          placeholder='Email'
          type='email'
          className='w-full rounded-lg border px-4 py-3'
        />
        {errors.email && <p className='text-red-600 text-xs'>{errors.email}</p>}

        {submitError && (
          <p className='text-red-600 text-center'>{submitError}</p>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition'
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
