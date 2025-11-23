import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { Trash2, Plus, CornerDownRight, Loader } from 'lucide-react';

// Tailwind CSS is assumed to be available.
// All styles are applied using Tailwind CSS classes for responsiveness.

// Usage of global variables is mandatory.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' ? __firebase_config : '{}',
);
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

/**
 * Utility function to generate a collection path for public data.
 * Creates the public collection path according to database security rules.
 */
const getPublicCollectionPath = (collectionName) => {
  return `artifacts/${appId}/public/data/${collectionName}`;
};

const statusColumns = [
  { id: 'todo', name: 'To Do', color: 'bg-red-500' },
  { id: 'inProgress', name: 'In Progress', color: 'bg-yellow-500' },
  { id: 'done', name: 'Done', color: 'bg-green-500' },
];

// Main Application Component
export default function App() {
  // Firebase State
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Application State
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const authenticate = async () => {
        if (initialAuthToken) {
          await signInWithCustomToken(firebaseAuth, initialAuthToken);
        } else {
          await signInAnonymously(firebaseAuth);
        }
        const currentUserId =
          firebaseAuth.currentUser?.uid || crypto.randomUUID();
        setUserId(currentUserId);
        setIsAuthReady(true);
        console.log(
          'Firebase and Authentication Successful. User ID:',
          currentUserId,
        );
      };
      authenticate();
    } catch (err) {
      console.error('An error occurred while initializing Firebase:', err);
      setError('Database connection could not be established.');
      setIsLoading(false);
    }
  }, []); // Runs only once

  // 2. Real-time Task Listening (onSnapshot)
  useEffect(() => {
    if (db && isAuthReady) {
      setIsLoading(true);
      const tasksCollectionRef = collection(
        db,
        getPublicCollectionPath('tasks'),
      );
      // Firestore query is created (if sorting is required, it is done in JS)
      const tasksQuery = query(tasksCollectionRef);

      const unsubscribe = onSnapshot(
        tasksQuery,
        (snapshot) => {
          try {
            const fetchedTasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              // Convert Firestore Timestamp object to Date object
              createdAt: doc.data().createdAt
                ? doc.data().createdAt.toDate()
                : new Date(),
            }));

            // Loading finished. Let's sort the data by date.
            fetchedTasks.sort((a, b) => b.createdAt - a.createdAt);

            setTasks(fetchedTasks);
            setIsLoading(false);
          } catch (e) {
            console.error('Error while fetching tasks:', e);
            setError('A problem occurred while loading tasks.');
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error in Firestore listener:', err);
          setError('Data listening connection was disconnected.');
          setIsLoading(false);
        },
      );

      // Cleanup function
      return () => unsubscribe();
    }
  }, [db, isAuthReady]); // Reruns when db and authentication are ready

  // Function to Add New Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!db || !isAuthReady || newTaskTitle.trim() === '') return;

    try {
      await addDoc(collection(db, getPublicCollectionPath('tasks')), {
        title: newTaskTitle.trim(),
        status: 'todo', // Initial status
        createdAt: Timestamp.fromDate(new Date()),
        ownerId: userId, // Save the user who created the task
      });
      setNewTaskTitle('');
    } catch (e) {
      console.error('Error while adding task:', e);
      setError('Could not add new task.');
    }
  };

  // Function to Update Task Status
  const handleUpdateTaskStatus = useCallback(
    async (taskId, newStatus) => {
      if (!db || !isAuthReady || !taskId) return;

      try {
        const taskRef = doc(db, getPublicCollectionPath('tasks'), taskId);
        await updateDoc(taskRef, { status: newStatus });
      } catch (e) {
        console.error('Error while updating task status:', e);
        setError('Task status could not be updated.');
      }
    },
    [db, isAuthReady],
  );

  // Function to Delete Task
  const handleDeleteTask = useCallback(
    async (taskId) => {
      if (!db || !isAuthReady || !taskId) return;

      // We could use a custom modal (alert box) here, but for simplicity, we delete directly.
      if (window.confirm('Are you sure you want to delete this task?')) {
        try {
          const taskRef = doc(db, getPublicCollectionPath('tasks'), taskId);
          await deleteDoc(taskRef);
        } catch (e) {
          console.error('Error while deleting task:', e);
          setError('Could not delete task.');
        }
      }
    },
    [db, isAuthReady],
  );

  // UI Components
  const Column = ({ columnId, columnName, color }) => {
    const columnTasks = tasks.filter((task) => task.status === columnId);

    return (
      <div className='flex-1 min-w-[280px] p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg m-2'>
        <h2
          className={`text-xl font-bold mb-4 flex items-center p-2 text-white rounded-lg ${color}`}
        >
          {columnName}
          <span className='ml-2 px-2 py-0.5 text-xs bg-white text-gray-800 rounded-full'>
            {columnTasks.length}
          </span>
        </h2>
        <div className='space-y-3 min-h-[100px]'>
          {columnTasks.length === 0 && (
            <p className='text-gray-500 text-sm italic'>
              No tasks in this column.
            </p>
          )}
          {columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              handleUpdateTaskStatus={handleUpdateTaskStatus}
              handleDeleteTask={handleDeleteTask}
              currentColumnId={columnId}
            />
          ))}
        </div>
      </div>
    );
  };

  const TaskCard = ({
    task,
    handleUpdateTaskStatus,
    handleDeleteTask,
    currentColumnId,
  }) => {
    return (
      <div className='bg-white p-3 rounded-lg shadow-md border-t-4 border-indigo-400 hover:shadow-xl transition duration-300'>
        <p className='font-medium text-gray-800 break-words'>{task.title}</p>
        <div className='flex items-center justify-between mt-2 text-xs text-gray-500'>
          <span className='truncate' title={`Created by: ${task.ownerId}`}>
            <span className='font-bold'>ID:</span>{' '}
            {task.ownerId.substring(0, 8)}...
          </span>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className='p-1 text-gray-400 hover:text-red-600 transition duration-150 rounded-full'
            aria-label='Delete Task'
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className='mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end'>
          {statusColumns
            .filter((col) => col.id !== currentColumnId)
            .map((col) => (
              <button
                key={col.id}
                onClick={() => handleUpdateTaskStatus(task.id, col.id)}
                className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full transition duration-150 
                                ${
                                  col.id === 'done'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : col.id === 'inProgress'
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
              >
                <CornerDownRight size={12} className='mr-1' />
                {col.name}
              </button>
            ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className='p-8 text-center bg-red-100 text-red-700 rounded-xl shadow-lg max-w-lg mx-auto mt-10'>
        <h1 className='text-2xl font-bold mb-4'>Error!</h1>
        <p>{error}</p>
        <p className='mt-4 text-sm'>Please check the console logs.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 font-inter'>
      <style>{`
                .font-inter { font-family: 'Inter', sans-serif; }
                .kanban-container {
                    display: flex;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                }
            `}</style>

      <header className='py-6 mb-6 bg-white shadow-md rounded-xl'>
        <div className='max-w-7xl mx-auto px-4'>
          <h1 className='text-3xl font-extrabold text-gray-900 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 text-indigo-600 mr-3'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 4a1 1 0 011-1h3.707a1 1 0 01.707.293L11.586 7H16a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm4 2a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1zM9 7a1 1 0 00-1 1v5a1 1 0 102 0V8a1 1 0 00-1-1zM11 8a1 1 0 00-1 1v4a1 1 0 102 0V9a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            Kanban Task Tracker
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Public Collaboration Space
          </p>
          <p className='text-xs text-indigo-500 mt-2'>
            User ID (For Collaboration):{' '}
            <span className='font-mono bg-indigo-100 p-1 rounded'>
              {userId || 'Loading...'}
            </span>
          </p>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4'>
        {/* New Task Addition Form */}
        <form
          onSubmit={handleAddTask}
          className='flex items-center space-x-3 mb-8 p-4 bg-white rounded-xl shadow-lg'
        >
          <input
            type='text'
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder='Enter new task title...'
            className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150'
            disabled={!isAuthReady}
            required
          />
          <button
            type='submit'
            className='flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50'
            disabled={!isAuthReady || newTaskTitle.trim() === ''}
          >
            <Plus size={20} className='mr-2' />
            Add
          </button>
        </form>

        {/* Loading Status */}
        {isLoading && (
          <div className='flex justify-center items-center py-10 text-indigo-600'>
            <Loader size={24} className='animate-spin mr-2' />
            Tasks Loading...
          </div>
        )}

        {/* Kanban Columns */}
        {!isLoading && (
          <div className='kanban-container flex space-x-4'>
            {statusColumns.map((column) => (
              <Column
                key={column.id}
                columnId={column.id}
                columnName={column.name}
                color={column.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
