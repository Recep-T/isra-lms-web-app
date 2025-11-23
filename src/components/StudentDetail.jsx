import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get, set, update, push, onValue } from 'firebase/database';
import { HiArrowLeft } from 'react-icons/hi';

export default function StudentDetail() {
  const { emailKey, studentId } = useParams();
  const navigate = useNavigate();

  const isStudentView = !emailKey;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' });

  useEffect(() => {
    const baseRef = isStudentView
      ? ref(db, 'users')
      : ref(db, `users/${emailKey}/students/${studentId}`);

    const unsub = onValue(baseRef, async (snap) => {
      let tasksNode = null;
      let assignedBy = null;

      if (!snap.exists()) {
        setStudent(null);
        setLoading(false);
        return;
      }

      if (isStudentView) {
        const allUsers = snap.val();
        for (const teacherId of Object.keys(allUsers)) {
          const s = allUsers[teacherId]?.students?.[studentId];
          if (s) {
            tasksNode = s;
            assignedBy = teacherId;
            break;
          }
        }
      } else {
        tasksNode = snap.val();
        assignedBy = emailKey;
      }

      if (!tasksNode) {
        setStudent(null);
        setLoading(false);
        return;
      }

      const detailsSnap = await get(ref(db, `users/${studentId}`));
      const details = detailsSnap.exists() ? detailsSnap.val() : {};
      setStudent({
        id: studentId,
        assignedBy,
        name: `${details.name || ''} ${details.lastName || ''}`.trim(),
        email: details.email || studentId.replace(/_/g, '.'),
        tasks: tasksNode.tasks || {},
      });

      setLoading(false);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, emailKey, studentId, isStudentView]);

  // Educator adds new task
  const handleAddTask = async () => {
    if (isStudentView) return;
    if (!newTask.title.trim() || !newTask.dueDate) return;

    const taskRef = push(
      ref(db, `users/${emailKey}/students/${studentId}/tasks`),
    );
    await set(taskRef, {
      title: newTask.title.trim(),
      status: 'To Do',
      assignedDate: new Date().toISOString(),
      dueDate: newTask.dueDate,
      lastUpdated: new Date().toISOString(),
    });

    setNewTask({ title: '', dueDate: '' });
  };

  // ✅ Both educator and student can update status
  const handleStatusChange = async (taskId, status) => {
    const updatePath = isStudentView
      ? `users/${student.assignedBy}/students/${studentId}/tasks/${taskId}`
      : `users/${emailKey}/students/${studentId}/tasks/${taskId}`;

    await update(ref(db, updatePath), {
      status,
      lastUpdated: new Date().toISOString(),
    });
  };

  const progress = (() => {
    if (!student?.tasks) return { completed: 0, total: 0, percent: 0 };
    const total = Object.keys(student.tasks).length;
    const completed = Object.values(student.tasks).filter(
      (t) => t.status === 'Completed',
    ).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  })();

  if (loading)
    return (
      <p className='text-center text-indigo-600 mt-20'>
        Loading student data...
      </p>
    );

  if (!student)
    return (
      <p className='text-center text-gray-600 mt-20'>Student not found.</p>
    );

  return (
    <div className='min-h-screen bg-gradient-to-br from-white to-indigo-50 p-8'>
      <button
        onClick={() => navigate(-1)}
        className='flex items-center text-indigo-600 hover:text-indigo-800 mb-6'
      >
        <HiArrowLeft className='w-5 h-5 mr-2' /> Back to Dashboard
      </button>

      <h1 className='text-2xl font-bold text-gray-800 mb-2'>
        {student.name || '(No Name)'} ({student.email})
      </h1>

      <div className='bg-gradient-to-r from-indigo-600 to-purple-500 p-4 rounded-xl shadow-md mb-6 text-white'>
        <h2 className='text-lg font-semibold mb-2'>Progress Overview</h2>
        <p className='text-sm mb-2'>
          {progress.completed}/{progress.total} tasks completed
        </p>
        <div className='w-full bg-indigo-200 rounded-full h-3 overflow-hidden'>
          <div
            className='bg-white h-3 rounded-full transition-all duration-500'
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className='text-right text-xs mt-1'>{progress.percent}% completed</p>
      </div>

      <div className='bg-white p-6 rounded-xl shadow-md'>
        {/* 🔐 Add task — educator only */}
        {!isStudentView && (
          <>
            <h2 className='text-lg font-semibold mb-3 text-indigo-700'>
              Add New Task
            </h2>
            <div className='flex flex-col md:flex-row gap-3 mb-6'>
              <input
                type='text'
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder='Task Title'
                className='flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400'
              />
              <input
                type='date'
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className='border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400'
              />
              <button
                onClick={handleAddTask}
                className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition'
              >
                Add Task
              </button>
            </div>
          </>
        )}

        {/* 📋 Task list */}
        <h3 className='font-semibold text-gray-700 mb-3'>Assigned Tasks</h3>
        {student.tasks && Object.keys(student.tasks).length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full border border-gray-200 rounded-lg text-sm'>
              <thead>
                <tr className='bg-indigo-100 text-indigo-700'>
                  <th className='px-4 py-2 border text-left'>Title</th>
                  <th className='px-4 py-2 border text-left'>Due Date</th>
                  <th className='px-4 py-2 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(student.tasks).map(([taskId, task]) => (
                  <tr key={taskId} className='hover:bg-indigo-50 transition'>
                    <td className='px-4 py-2 border text-gray-800'>
                      {task.title}
                    </td>
                    <td className='px-4 py-2 border text-gray-600'>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className='px-4 py-2 border text-center'>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(taskId, e.target.value)
                        }
                        className={`rounded-lg px-2 py-1 border text-xs md:text-sm ${
                          task.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value='To Do'>To Do</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Completed'>Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-gray-400 text-sm'>No assigned tasks yet.</p>
        )}
      </div>
    </div>
  );
}
