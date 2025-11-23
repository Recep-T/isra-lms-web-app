// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, set, onValue, push } from 'firebase/database';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function Dashboard() {
  const { studentId } = useParams();
  const today = getToday();
  const week = last7Days();

  const [metrics, setMetrics] = useState({
    applicationsSubmitted: '',
    connectionsAdded: '',
    hoursStudied: '',
    selfReflection: '',
  });
  const [todayData, setTodayData] = useState(null);
  const [allData, setAllData] = useState({});
  const [success, setSuccess] = useState('');

  const [messageCount, setMessageCount] = useState('');
  const [todayMessageCount, setTodayMessageCount] = useState(0);

  // Upcoming phone calls and tech interviews
  const [upcomingPhoneCalls, setUpcomingPhoneCalls] = useState([]);
  const [upcomingTechInterviews, setUpcomingTechInterviews] = useState([]);

  const [phoneCallDate, setPhoneCallDate] = useState('');
  const [phoneCallComment, setPhoneCallComment] = useState('');
  const [techInterviewDate, setTechInterviewDate] = useState('');
  const [techInterviewComment, setTechInterviewComment] = useState('');

  // Load dailyMetrics
  useEffect(() => {
    const metricsRef = ref(db, `students/${studentId}/dailyMetrics`);
    const unsub = onValue(metricsRef, (snap) => {
      const data = snap.val() || {};
      setAllData(data);
      setTodayData(data[today] || null);
    });
    return () => unsub();
  }, [studentId, today]);

  // Load messageLogs
  useEffect(() => {
    const msgRef = ref(db, `students/${studentId}/messageLogs/${today}`);
    const unsubMsg = onValue(msgRef, (snap) => {
      setTodayMessageCount(snap.val() || 0);
    });
    return () => unsubMsg();
  }, [studentId, today]);

  // Load upcoming phone calls
  useEffect(() => {
    const phoneRef = ref(db, `students/${studentId}/upcomingPhoneCalls`);
    const unsubPhone = onValue(phoneRef, (snap) => {
      const data = snap.val() || {};
      setUpcomingPhoneCalls(
        Object.entries(data).map(([key, val]) => ({ id: key, ...val })),
      );
    });
    return () => unsubPhone();
  }, [studentId]);

  // Load upcoming tech interviews
  useEffect(() => {
    const techRef = ref(db, `students/${studentId}/upcomingTechInterviews`);
    const unsubTech = onValue(techRef, (snap) => {
      const data = snap.val() || {};
      setUpcomingTechInterviews(
        Object.entries(data).map(([key, val]) => ({ id: key, ...val })),
      );
    });
    return () => unsubTech();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mRef = ref(db, `students/${studentId}/dailyMetrics/${today}`);
    await set(mRef, {
      applicationsSubmitted: +metrics.applicationsSubmitted || 0,
      connectionsAdded: +metrics.connectionsAdded || 0,
      hoursStudied: +metrics.hoursStudied || 0,
      selfReflection: metrics.selfReflection,
      createdAt: new Date().toISOString(),
    });
    setSuccess('Saved successfully!');
    setMetrics({
      applicationsSubmitted: '',
      connectionsAdded: '',
      hoursStudied: '',
      selfReflection: '',
    });
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleLogMessage = async (e) => {
    e.preventDefault();
    const count = parseInt(messageCount, 10) || 0;
    const msgRef = ref(db, `students/${studentId}/messageLogs/${today}`);
    await set(msgRef, todayMessageCount + count);
    setMessageCount('');
  };

  const handleAddPhoneCall = async () => {
    if (!phoneCallDate) return;
    const newRef = push(ref(db, `students/${studentId}/upcomingPhoneCalls`));
    await set(newRef, {
      date: phoneCallDate,
      comment: phoneCallComment,
    });
    setPhoneCallDate('');
    setPhoneCallComment('');
  };

  const handleAddTechInterview = async () => {
    if (!techInterviewDate) return;
    const newRef = push(
      ref(db, `students/${studentId}/upcomingTechInterviews`),
    );
    await set(newRef, {
      date: techInterviewDate,
      comment: techInterviewComment,
    });
    setTechInterviewDate('');
    setTechInterviewComment('');
  };

  // Prepare chart data
  const chartData = week.map((date) => {
    const d = allData[date] || {};
    return {
      date: date.slice(5),
      apps: d.applicationsSubmitted || 0,
      conns: d.connectionsAdded || 0,
    };
  });

  // Totals
  const weekTotals = chartData.reduce(
    (acc, cur) => ({
      apps: acc.apps + cur.apps,
      conns: acc.conns + cur.conns,
    }),
    { apps: 0, conns: 0 },
  );

  return (
    <div className='min-h-screen bg-blue-100 p-6 dark:bg-gray-900'>
      <div className='max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8'>
        <h1 className='text-3xl font-extrabold mb-6 text-center text-blue-900 dark:text-blue-400'>
          Your Dashboard
        </h1>

        {/* Summary */}
        <div className='grid grid-cols-2 gap-6 mb-8'>
          <div className='p-6 bg-blue-500 dark:bg-blue-700 rounded-lg shadow text-center text-white'>
            <p className='text-lg font-semibold'>Applications This Week</p>
            <p className='text-4xl font-extrabold'>{weekTotals.apps}</p>
          </div>
          <div className='p-6 bg-green-500 dark:bg-green-700 rounded-lg shadow text-center text-white'>
            <p className='text-lg font-semibold'>Connections This Week</p>
            <p className='text-4xl font-extrabold'>{weekTotals.conns}</p>
          </div>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 gap-6 mb-8'>
          <div className='h-48'>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' stroke='#1e3a8a' />
                <YAxis stroke='#1e3a8a' />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='apps'
                  stroke='#3b82f6'
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className='h-48'>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' stroke='#065f46' />
                <YAxis stroke='#065f46' />
                <Tooltip />
                <Bar dataKey='conns' fill='#10b981' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Data */}
        {todayData && (
          <div className='mb-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-inner'>
            <h2 className='font-bold mb-3 text-blue-800 dark:text-blue-300'>
              Today's Data
            </h2>
            <p>
              <strong>Applications Submitted:</strong>{' '}
              {todayData.applicationsSubmitted}
            </p>
            <p>
              <strong>Connections Added:</strong> {todayData.connectionsAdded}
            </p>
            <p>
              <strong>Hours Studied:</strong> {todayData.hoursStudied}
            </p>
            <p>
              <strong>Reflection:</strong> {todayData.selfReflection || '-'}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-5 mb-8'>
          <input
            type='number'
            placeholder='Applications Submitted'
            value={metrics.applicationsSubmitted}
            onChange={(e) =>
              setMetrics({ ...metrics, applicationsSubmitted: e.target.value })
            }
            className='w-full p-3 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600'
          />
          <input
            type='number'
            placeholder='Connections Added'
            value={metrics.connectionsAdded}
            onChange={(e) =>
              setMetrics({ ...metrics, connectionsAdded: e.target.value })
            }
            className='w-full p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600'
          />
          <input
            type='number'
            placeholder='Hours Studied'
            step='0.1'
            value={metrics.hoursStudied}
            onChange={(e) =>
              setMetrics({ ...metrics, hoursStudied: e.target.value })
            }
            className='w-full p-3 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600'
          />
          <textarea
            placeholder='Self Reflection'
            value={metrics.selfReflection}
            onChange={(e) =>
              setMetrics({ ...metrics, selfReflection: e.target.value })
            }
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
          />
          <button
            type='submit'
            className='w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition'
          >
            Save Metrics
          </button>
          {success && (
            <p className='text-center text-green-600 font-medium mt-2'>
              {success}
            </p>
          )}
        </form>

        {/* Message Logger */}
        <div className='mb-8 p-6 bg-green-50 dark:bg-green-900 rounded-lg shadow-inner'>
          <h2 className='font-bold mb-4 text-green-700 dark:text-green-300'>
            Log Messages to HR
          </h2>
          <p className='mb-3'>
            Messages Today:{' '}
            <span className='font-semibold'>{todayMessageCount}</span>
          </p>
          <form onSubmit={handleLogMessage} className='flex gap-3'>
            <input
              type='number'
              min='1'
              placeholder='Count'
              value={messageCount}
              onChange={(e) => setMessageCount(e.target.value)}
              className='flex-1 p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600'
            />
            <button
              type='submit'
              className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition'
            >
              Log Message
            </button>
          </form>
        </div>

        {/* Upcoming Phone Calls */}
        <div className='mb-8 p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow-inner'>
          <h2 className='font-bold mb-3 text-yellow-800 dark:text-yellow-300'>
            Upcoming Phone Calls
          </h2>
          {upcomingPhoneCalls.length === 0 ? (
            <p className='italic'>No upcoming phone calls.</p>
          ) : (
            <ul className='list-disc list-inside mb-4'>
              {upcomingPhoneCalls.map((call) => (
                <li key={call.id}>
                  <strong>{call.date}</strong>: {call.comment || '-'}
                </li>
              ))}
            </ul>
          )}
          <div className='space-y-2'>
            <input
              type='date'
              value={phoneCallDate}
              onChange={(e) => setPhoneCallDate(e.target.value)}
              className='border rounded px-3 py-2 w-full'
            />
            <input
              type='text'
              placeholder='Phone call comment'
              value={phoneCallComment}
              onChange={(e) => setPhoneCallComment(e.target.value)}
              className='border rounded px-3 py-2 w-full'
            />
            <button
              onClick={handleAddPhoneCall}
              className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded'
            >
              Add Phone Call
            </button>
          </div>
        </div>

        {/* Upcoming Tech Interviews */}
        <div className='mb-8 p-6 bg-purple-50 dark:bg-purple-900 rounded-lg shadow-inner'>
          <h2 className='font-bold mb-3 text-purple-800 dark:text-purple-300'>
            Upcoming Tech Interviews
          </h2>
          {upcomingTechInterviews.length === 0 ? (
            <p className='italic'>No upcoming technical interviews.</p>
          ) : (
            <ul className='list-disc list-inside mb-4'>
              {upcomingTechInterviews.map((interview) => (
                <li key={interview.id}>
                  <strong>{interview.date}</strong>: {interview.comment || '-'}
                </li>
              ))}
            </ul>
          )}
          <div className='space-y-2'>
            <input
              type='date'
              value={techInterviewDate}
              onChange={(e) => setTechInterviewDate(e.target.value)}
              className='border rounded px-3 py-2 w-full'
            />
            <input
              type='text'
              placeholder='Tech interview comment'
              value={techInterviewComment}
              onChange={(e) => setTechInterviewComment(e.target.value)}
              className='border rounded px-3 py-2 w-full'
            />
            <button
              onClick={handleAddTechInterview}
              className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded'
            >
              Add Tech Interview
            </button>
          </div>
        </div>

        {/* LinkedIn */}
        <div className='p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-inner'>
          <h2 className='font-bold mb-4 text-blue-800 dark:text-blue-300'>
            Share on LinkedIn
          </h2>
          <button
            onClick={() =>
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `https://yourapp.com/dashboard/${studentId}`,
                )}`,
                '_blank',
              )
            }
            className='w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition'
          >
            Post Your Progress
          </button>
        </div>
      </div>
    </div>
  );
}
