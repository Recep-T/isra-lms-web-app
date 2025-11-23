/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue, get, set, remove } from 'firebase/database';
import {
  HiClipboardList,
  HiLogout,
  HiChartPie,
  HiTrendingUp,
  HiUserGroup,
  HiCheckCircle,
  HiCalendar,
  HiTable,
  HiExternalLink,
  HiX,
  HiUserAdd,
  HiTrash,
  HiSearch,
} from 'react-icons/hi';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  isBefore,
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';

/* ---------- date-fns localizer ---------- */
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

/* ---------------- Helpers ---------------- */
const emailToKey = (e) => e.trim().toLowerCase().replace(/\./g, '_');

/* Debounce hook */
function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* Click outside hook */
function useOnClickOutside(refEl, handler) {
  useEffect(() => {
    function listener(e) {
      if (!refEl.current || refEl.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refEl, handler]);
}

/* =========================================
   Educator Dashboard (Stage 4)
   - Smart global search (users/* where role === 'individual')
   - Debounced suggestions dropdown
   - Add to my students directly from search
   - "No results" message if not found
   - Keeps Stage 3 features
========================================= */
export default function EducatorDashboard() {
  const { emailKey } = useParams(); // educator id key
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  // UI mode: "table" or "calendar"
  const [viewMode, setViewMode] = useState('table');

  // Timeline modal
  const [timelineStudent, setTimelineStudent] = useState(null);

  // Search (filters current table + drives global suggestions)
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 450);

  // Manual add by email
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState(null);
  const showFeedback = (msg, type = 'info') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 2200);
  };

  /* ---------- Live sync students + tasks ---------- */
  useEffect(() => {
    const studentsRef = ref(db, `users/${emailKey}/students`);
    const unsub = onValue(studentsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formatted = await Promise.all(
          Object.entries(data).map(async ([id, student]) => {
            const studentSnap = await get(ref(db, `users/${id}`));
            const details = studentSnap.exists() ? studentSnap.val() : {};
            const tasks = student.tasks || {};

            const total = Object.keys(tasks).length;
            const completed = Object.values(tasks).filter(
              (t) => t.status === 'Completed',
            ).length;
            const inProgress = Object.values(tasks).filter(
              (t) => t.status === 'In Progress',
            ).length;
            const overdue = Object.values(tasks).filter((t) => {
              const due = t.dueDate ? new Date(t.dueDate) : null;
              return (
                t.status !== 'Completed' && due && isBefore(due, new Date())
              );
            }).length;

            const percent =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            const normalizedTasks = Object.entries(tasks).map(
              ([taskId, t]) => ({
                id: taskId,
                title: t.title,
                status: t.status,
                assignedDate: t.assignedDate || null,
                dueDate: t.dueDate || null,
                lastUpdated: t.lastUpdated || t.updatedAt || null,
              }),
            );

            return {
              id,
              name: `${details.name || ''} ${details.lastName || ''}`.trim(),
              email: details.email || id.replace(/_/g, '.'),
              total,
              completed,
              inProgress,
              overdue,
              percent,
              tasks: normalizedTasks,
            };
          }),
        );

        setStudents(formatted);

        // Summary stats
        const totalTasks = formatted.reduce((a, b) => a + b.total, 0);
        const completed = formatted.reduce((a, b) => a + b.completed, 0);
        const inProgress = formatted.reduce((a, b) => a + b.inProgress, 0);
        const overdue = formatted.reduce((a, b) => a + b.overdue, 0);

        setStats({
          totalStudents: formatted.length,
          totalTasks,
          completed,
          inProgress,
          overdue,
        });
      } else {
        setStudents([]);
        setStats({
          totalStudents: 0,
          totalTasks: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [emailKey]);

  const handleLogout = () => navigate('/login');

  /* ---------- Calendar events ---------- */
  const calendarEvents = useMemo(() => {
    const events = [];
    for (const s of students) {
      for (const t of s.tasks) {
        if (!t.dueDate) continue;
        const start = new Date(t.dueDate);
        const end = addMinutes(start, 30);
        const isOver = t.status !== 'Completed' && isBefore(start, new Date());
        events.push({
          id: `${s.id}-${t.id}`,
          title: `${s.name || '(No Name)'}: ${t.title}`,
          start,
          end,
          status: isOver ? 'Overdue' : t.status || 'To Do',
          studentId: s.id,
          studentName: s.name || '(No Name)',
          raw: t,
        });
      }
    }
    return events;
  }, [students]);

  const eventPropGetter = (event) => {
    let bg = '#e5e7eb';
    if (event.status === 'Completed') bg = '#22c55e';
    else if (event.status === 'In Progress') bg = '#f59e0b';
    else if (event.status === 'Overdue') bg = '#ef4444';
    return { style: { backgroundColor: bg, borderRadius: 8, border: 'none' } };
  };

  /* ---------- Global users cache for search suggestions ---------- */
  const [usersCache, setUsersCache] = useState(null);
  useEffect(() => {
    // Lazy load once (role === 'individual')
    const load = async () => {
      try {
        const snap = await get(ref(db, 'users'));
        if (snap.exists()) {
          const all = snap.val();
          // only individual (students)
          const filtered = Object.entries(all)
            .filter(([, u]) => (u?.role || 'individual') === 'individual')
            .map(([id, u]) => ({
              id,
              name: `${u?.name || ''} ${u?.lastName || ''}`.trim(),
              email: u?.email || id.replace(/_/g, '.'),
              role: u?.role || 'individual',
            }));
          setUsersCache(filtered);
        } else {
          setUsersCache([]);
        }
      } catch (e) {
        console.error(e);
        setUsersCache([]);
      }
    };
    load();
  }, []);

  /* ---------- Suggestions (debounced, excludes already-linked) ---------- */
  const linkedIds = useMemo(
    () => new Set(students.map((s) => s.id)),
    [students],
  );

  const suggestions = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q || !usersCache) return [];
    // match name, lastName (part of name), or email
    return usersCache
      .filter((u) => {
        if (linkedIds.has(u.id)) return false; // already linked
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .slice(0, 8);
  }, [debouncedSearch, usersCache, linkedIds]);

  /* ---------- Add student (from suggestion or manual email) ---------- */
  const [addBusyId, setAddBusyId] = useState(null);
  const handleAddById = async (userId, email) => {
    setAddBusyId(userId);
    try {
      const eduRef = ref(db, `users/${emailKey}/students/${userId}`);
      const exists = await get(eduRef);
      if (exists.exists()) {
        showFeedback('This student is already linked.', 'warn');
      } else {
        await set(eduRef, { email, tasks: {} });
        showFeedback('Student added successfully.', 'ok');
      }
    } catch (e) {
      console.error(e);
      showFeedback('Failed to add student.', 'err');
    } finally {
      setAddBusyId(null);
    }
  };

  const handleAddStudentEmail = async () => {
    const email = newStudentEmail.trim().toLowerCase();
    if (!email) return;
    setAddBusy(true);
    try {
      const sKey = emailToKey(email);
      // ensure base user exists; if not, create minimal
      const userRef = ref(db, `users/${sKey}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) {
        await set(userRef, {
          email,
          role: 'individual',
          name: '',
          lastName: '',
          createdAt: new Date().toISOString(),
        });
      }
      // link under educator
      const eduRef = ref(db, `users/${emailKey}/students/${sKey}`);
      const eduSnap = await get(eduRef);
      if (eduSnap.exists()) {
        showFeedback('This student is already linked.', 'warn');
      } else {
        await set(eduRef, { email, tasks: {} });
        showFeedback('Student added successfully.', 'ok');
      }
      setNewStudentEmail('');
    } catch (e) {
      console.error(e);
      showFeedback('Failed to add student.', 'err');
    } finally {
      setAddBusy(false);
    }
  };

  /* ---------- Unlink (delete) student from educator list ---------- */
  const handleUnlinkStudent = async (studentId) => {
    if (
      !window.confirm(
        'Remove this student from your list? (Tasks under your list will be removed)',
      )
    )
      return;
    try {
      await remove(ref(db, `users/${emailKey}/students/${studentId}`));
      showFeedback('Student removed.', 'ok');
    } catch (e) {
      console.error(e);
      showFeedback('Failed to remove student.', 'err');
    }
  };

  /* ---------- Filtered table rows (within your list) ---------- */
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [students, search]);

  /* close suggestions on outside click */
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  useOnClickOutside(dropdownRef, () => setOpenDropdown(false));

  useEffect(() => {
    // open dropdown only if there is query
    setOpenDropdown(Boolean(debouncedSearch && suggestions.length > 0));
  }, [debouncedSearch, suggestions.length]);

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center text-indigo-600 text-xl'>
        Loading Educator Dashboard...
      </div>
    );

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <h1 className='text-3xl font-extrabold text-indigo-700 flex items-center'>
          <HiClipboardList className='w-7 h-7 mr-2 text-indigo-600' />
          Educator Dashboard
        </h1>

        {/* View toggle + Logout */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg shadow ${
              viewMode === 'table'
                ? 'bg-white text-indigo-700 border border-indigo-200'
                : 'bg-indigo-600 text-white'
            } flex items-center gap-2`}
          >
            <HiTable className='w-5 h-5' /> Table
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg shadow ${
              viewMode === 'calendar'
                ? 'bg-white text-indigo-700 border border-indigo-200'
                : 'bg-indigo-600 text-white'
            } flex items-center gap-2`}
          >
            <HiCalendar className='w-5 h-5' /> Week Calendar
          </button>

          <button
            onClick={handleLogout}
            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition ml-2'
          >
            <HiLogout className='inline w-5 h-5 mr-1' />
            Logout
          </button>
        </div>
      </div>

      {/* Persistent Smart Add + Search Bar */}
      <div className='bg-white rounded-xl shadow-md p-4 mb-6'>
        <div className='flex flex-col md:flex-row gap-3 relative'>
          {/* Smart Search (filters + suggestions) */}
          <div className='flex-1 relative' ref={dropdownRef}>
            <HiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search students by name or email (global lookup)…'
              className='w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400'
              onFocus={() => {
                if (suggestions.length > 0 && debouncedSearch)
                  setOpenDropdown(true);
              }}
            />

            {/* Suggestions dropdown */}
            {openDropdown && (
              <div className='absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-auto'>
                {suggestions.map((u) => (
                  <div
                    key={u.id}
                    className='flex items-center justify-between px-3 py-2 hover:bg-indigo-50'
                  >
                    <div>
                      <p className='text-sm font-medium text-gray-800'>
                        {u.name || '(No Name)'}{' '}
                        <span className='text-xs text-gray-400'>
                          ({u.role})
                        </span>
                      </p>
                      <p className='text-xs text-gray-500'>{u.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleAddById(u.id, u.email);
                        setOpenDropdown(false);
                      }}
                      disabled={addBusyId === u.id}
                      className={`px-3 py-1 rounded-lg text-white text-xs flex items-center gap-1 ${
                        addBusyId === u.id
                          ? 'bg-indigo-300'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <HiUserAdd className='w-4 h-4' />
                      {addBusyId === u.id ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                ))}

                {/* Empty state */}
                {debouncedSearch && suggestions.length === 0 && (
                  <div className='px-3 py-4 text-sm text-gray-600'>
                    No student found in database. You can add manually by email.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual add by email */}
          <div className='flex gap-2'>
            <input
              type='email'
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder='Add student by email'
              className='w-full md:w-72 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400'
            />
            <button
              onClick={handleAddStudentEmail}
              disabled={addBusy || !newStudentEmail.trim()}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                addBusy ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              title='Link a student by email'
            >
              <HiUserAdd className='w-5 h-5' /> {addBusy ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* tiny feedback */}
        {feedback && (
          <div
            className={`mt-3 text-sm px-3 py-2 rounded-lg inline-block ${
              feedback.type === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : feedback.type === 'warn'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : feedback.type === 'err'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
        <StatCard
          icon={<HiUserGroup className='text-indigo-600 w-6 h-6' />}
          label='Students'
          value={stats.totalStudents}
        />
        <StatCard
          icon={<HiTrendingUp className='text-purple-600 w-6 h-6' />}
          label='Total Tasks'
          value={stats.totalTasks}
        />
        <StatCard
          icon={<HiCheckCircle className='text-green-600 w-6 h-6' />}
          label='Completed'
          value={stats.completed}
        />
        <StatCard
          icon={<HiChartPie className='text-yellow-500 w-6 h-6' />}
          label='In Progress'
          value={stats.inProgress}
        />
        <StatCard
          icon={<HiChartPie className='text-red-500 w-6 h-6' />}
          label='Overdue'
          value={stats.overdue}
        />
      </div>

      {/* Chart */}
      <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
        <h2 className='text-lg font-semibold text-gray-700 mb-3'>
          Task Overview
        </h2>
        <div className='w-full h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={[
                { name: 'Completed', value: stats.completed },
                { name: 'In Progress', value: stats.inProgress },
                { name: 'Overdue', value: stats.overdue },
              ]}
            >
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value' fill='#6366F1' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body: Table or Calendar */}
      {viewMode === 'table' ? (
        <StudentsTable
          students={filteredStudents}
          emailKey={emailKey}
          onOpenTimeline={setTimelineStudent}
          onUnlink={handleUnlinkStudent}
          navigate={navigate}
        />
      ) : (
        <div className='bg-white rounded-xl shadow-lg p-4'>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor='start'
            endAccessor='end'
            defaultView={Views.WEEK}
            views={[Views.WEEK]}
            style={{ height: 600 }}
            eventPropGetter={eventPropGetter}
            onSelectEvent={(evt) => {
              const s = students.find((x) => x.id === evt.studentId);
              if (s) setTimelineStudent(s);
            }}
          />
        </div>
      )}

      {/* Timeline modal */}
      {timelineStudent && (
        <TimelineModal
          student={timelineStudent}
          onClose={() => setTimelineStudent(null)}
          onOpenDetail={() =>
            navigate(
              `/educator-dashboard/${emailKey}/student/${timelineStudent.id}`,
            )
          }
        />
      )}
    </div>
  );
}

/* ---------- Stats Card ---------- */
const StatCard = ({ icon, label, value }) => (
  <div className='bg-white p-4 rounded-xl shadow-md flex items-center space-x-3'>
    <div className='p-2 bg-indigo-50 rounded-lg'>{icon}</div>
    <div>
      <p className='text-gray-500 text-sm'>{label}</p>
      <h3 className='text-xl font-bold text-indigo-700'>{value}</h3>
    </div>
  </div>
);

/* ---------- Students Table (with Unlink + Timeline/Open) ---------- */
function StudentsTable({
  students,
  emailKey,
  onOpenTimeline,
  onUnlink,
  navigate,
}) {
  return (
    <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
      <table className='min-w-full table-auto text-sm'>
        <thead className='bg-indigo-100 text-indigo-800'>
          <tr>
            <th className='px-6 py-3 text-left font-semibold'>Name</th>
            <th className='px-6 py-3 text-left font-semibold'>Email</th>
            <th className='px-6 py-3 text-left font-semibold'>Progress</th>
            <th className='px-6 py-3 text-center font-semibold'>Total</th>
            <th className='px-6 py-3 text-center font-semibold'>Completed</th>
            <th className='px-6 py-3 text-center font-semibold'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {students.map((s) => (
            <tr key={s.id} className='hover:bg-indigo-50 transition'>
              <td
                className='px-6 py-3 font-medium text-gray-800 cursor-pointer'
                onClick={() =>
                  navigate(`/educator-dashboard/${emailKey}/student/${s.id}`)
                }
              >
                {s.name || '(No Name)'}
              </td>
              <td className='px-6 py-3 text-gray-600'>{s.email}</td>
              <td className='px-6 py-3'>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <div
                    className={`h-2.5 rounded-full ${
                      s.percent >= 80
                        ? 'bg-green-500'
                        : s.percent >= 40
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                    }`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <p className='text-xs text-gray-500 mt-1'>{s.percent}%</p>
              </td>
              <td className='px-6 py-3 text-center text-gray-700'>{s.total}</td>
              <td className='px-6 py-3 text-center text-gray-700'>
                {s.completed}
              </td>
              <td className='px-6 py-3'>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={() => onOpenTimeline(s)}
                    className='px-3 py-1 text-xs rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    title='View Timeline'
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/educator-dashboard/${emailKey}/student/${s.id}`,
                      )
                    }
                    className='px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1'
                    title='Open Detail'
                  >
                    <HiExternalLink className='w-4 h-4' />
                    Open
                  </button>
                  <button
                    onClick={() => onUnlink(s.id)}
                    className='px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-1'
                    title='Remove from my list'
                  >
                    <HiTrash className='w-4 h-4' />
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                No students yet. Use the bar above to search and add by email.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Timeline Modal ---------- */
function TimelineModal({ student, onClose, onOpenDetail }) {
  const sorted = [...student.tasks].sort((a, b) => {
    const aT = new Date(a.assignedDate || a.dueDate || 0).getTime();
    const bT = new Date(b.assignedDate || b.dueDate || 0).getTime();
    return bT - aT;
  });

  const badgeClass = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'In Progress') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Overdue') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-xl font-bold text-gray-800'>
            {student.name || '(No Name)'} — Timeline
          </h3>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100'
            title='Close'
          >
            <HiX className='w-5 h-5 text-gray-600' />
          </button>
        </div>
        <p className='text-sm text-gray-500 mb-4'>{student.email}</p>

        <div className='max-h-[60vh] overflow-y-auto pr-1'>
          {sorted.length > 0 ? (
            <ul className='space-y-3'>
              {sorted.map((t) => (
                <li
                  key={t.id}
                  className='border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition'
                >
                  <div className='flex items-center justify-between'>
                    <p className='font-semibold text-gray-800'>{t.title}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${badgeClass(t.status)}`}
                    >
                      {t.status || 'To Do'}
                    </span>
                  </div>
                  <div className='text-xs text-gray-600 mt-1'>
                    {t.assignedDate && (
                      <span className='mr-3'>
                        Assigned: {new Date(t.assignedDate).toLocaleString()}
                      </span>
                    )}
                    {t.dueDate && (
                      <span>
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-gray-500'>No task history yet.</p>
          )}
        </div>

        <div className='mt-5 flex justify-end gap-2'>
          <button
            onClick={onOpenDetail}
            className='px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'
          >
            Open Student Page
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
