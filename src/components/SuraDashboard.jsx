/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudentDetail from './StudentDetail';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiUserCircle,
  HiPlay,
  HiLogout,
  HiBookOpen,
  HiSave,
  HiCheckCircle,
  HiStar,
} from 'react-icons/hi';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { suraData } from '../data/suraData';
import { questionsData } from '../data/questionsData';

// import Quiz from './Quiz';
// 🚀 DailyTracker Bileşeni İçe Aktarıldı
// import DailyTracker from './DailyTracker';

// =================================================================
// MOCK & UTILITY DEFINITIONS (For sandboxed environment compatibility)
// =================================================================

/**
 * Mock function for useNavigate. Logs to the console instead of actual navigation.
 * @returns {function(string): void} - The navigation function
 */
// const useNavigate = () => (path) => {
//     console.log(`[MOCK NAVIGATION] Navigation attempt: ${path}`);
// };

/**
 * Mock function for useParams. Returns a placeholder value for studentId.
 * @returns {{studentId: string}} - Mock parameters
 */
// const useParams = () => ({ studentId: 'mock-user-123' });

// Icon Placeholders (Replacing react-icons/hi)
const IconPlaceholder = ({ className, children }) => (
  <span
    className={className}
    style={{
      display: 'inline-block',
      lineHeight: '1',
      verticalAlign: 'middle',
    }}
  >
    {children}
  </span>
);

// Hi Icons
// const HiUserCircle = (props) => <IconPlaceholder {...props}>👤</IconPlaceholder>;
// const HiPlay = (props) => <IconPlaceholder {...props}>▶️</IconPlaceholder>;
// const HiLogout = (props) => <IconPlaceholder {...props}>🚪</IconPlaceholder>;
// const HiBookOpen = (props) => <IconPlaceholder {...props}>📖</IconPlaceholder>;
// const HiSave = (props) => <IconPlaceholder {...props}>💾</IconPlaceholder>;
// const HiCheckCircle = (props) => <IconPlaceholder {...props}>✅</IconPlaceholder>;
// const HiStar = (props) => <IconPlaceholder {...props}>⭐</IconPlaceholder>;
const HiMenu = (props) => <IconPlaceholder {...props}>☰</IconPlaceholder>;
const HiX = (props) => <IconPlaceholder {...props}>✖️</IconPlaceholder>;

// Lucide Icons (Replacing lucide-react in Quiz)
const CheckCircle = (props) => <IconPlaceholder {...props}>✅</IconPlaceholder>;
const XCircle = (props) => <IconPlaceholder {...props}>❌</IconPlaceholder>;
const Zap = (props) => <IconPlaceholder {...props}>⚡</IconPlaceholder>;
const Shield = (props) => <IconPlaceholder {...props}>🛡️</IconPlaceholder>;
const Star = (props) => <IconPlaceholder {...props}>⭐</IconPlaceholder>;
const RefreshCw = (props) => <IconPlaceholder {...props}>🔄</IconPlaceholder>;

// Placeholder for DailyTracker (Was used but not defined)
const DailyTracker = () => (
  <div className='text-gray-500 p-4 bg-white rounded-xl shadow-lg border-t-4 border-indigo-200'>
    <h3 className='text-2xl font-bold text-gray-700 mb-2 flex items-center'>
      <Zap className='w-5 h-5 mr-2 text-yellow-500' />
      Daily Progress Tracker
    </h3>
    <p>
      This is a placeholder for your daily memorization and revision tracking
      component.
    </p>
    <p className='text-sm mt-2 text-indigo-500'>
      *In the final application, this component will track daily goals and
      streak.*
    </p>
  </div>
);

/**
 * Converts a standard YouTube URL into an embeddable format.
 * Embed parameters (rel=0, modestbranding=1, playsinline=1) are added.
 * @param {string} url - Standard YouTube URL (watch?v=ID) or embed URL.
 * @returns {string} - Embeddable and restricted URL.
 */
const getEmbedUrl = (url) => {
  const videoIdMatch = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?]+)/);

  if (!videoIdMatch) {
    console.warn('Invalid YouTube URL format:', url);
    return url;
  }

  const videoId = videoIdMatch[1];
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;

  // playsinline=1 improves touch responsiveness.
  const params = `?rel=0&autoplay=1&mute=1&modestbranding=1&playsinline=1`;

  return `${baseUrl}${params}`;
};

// =================================================================
// QUIZ COMPONENT (Refactored from QuizApp)
// =================================================================
/**
 * Quiz Component (formerly QuizApp).
 * Note: The quiz content is generic Islamic trivia, not specific to the selected sura.
 */
const Quiz = ({ suraName, studentId, suraId }) => {
  // Accepting props but not using them (as per original design)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = questionsData[currentQuestionIndex];

  const HIGH_SCORE_KEY = 'islamicQuizHighScore';

  // Load High Score from Local Storage on initial load
  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update High Score logic
  useEffect(() => {
    if (showResult && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [showResult, score, highScore]);

  // Option selection handler
  const handleOptionClick = useCallback(
    (option) => {
      if (isAnswerChecked) return;
      setSelectedOption(option);
    },
    [isAnswerChecked],
  );

  // Check answer handler
  const handleCheckAnswer = useCallback(() => {
    if (!selectedOption || isAnswerChecked) return;

    setIsAnswerChecked(true);

    if (selectedOption === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
    }
  }, [selectedOption, isAnswerChecked, currentQuestion]);

  // Move to next question handler
  const handleNextQuestion = useCallback(() => {
    // Only proceed if the answer has been checked
    if (!isAnswerChecked) return;

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < questionsData.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setShowResult(true);
    }
  }, [currentQuestionIndex, isAnswerChecked]);

  // Restart quiz handler
  const handleRestartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
  }, []);

  // Function to determine option styling
  const getOptionStyle = useCallback(
    (option) => {
      let baseStyle =
        'p-3 text-left rounded-xl shadow-lg transition duration-200 cursor-pointer w-full text-gray-800 border-2 ';

      if (!isAnswerChecked) {
        // Styling based only on selection state
        baseStyle +=
          option === selectedOption
            ? 'bg-indigo-100 border-indigo-500'
            : 'bg-white hover:bg-gray-50 border-gray-200';
      } else {
        // Styling based on correct/incorrect/selected state after checking
        if (option === currentQuestion.answer) {
          // Correct answer (Green)
          baseStyle += 'bg-green-200 border-green-600 font-semibold';
        } else if (
          option === selectedOption &&
          option !== currentQuestion.answer
        ) {
          // Incorrectly selected answer (Red)
          baseStyle += 'bg-red-200 border-red-600 font-semibold';
        } else {
          // Other options (Passive grey)
          baseStyle += 'bg-gray-100 border-gray-300 opacity-70';
        }
        baseStyle += ' pointer-events-none'; // Disable clicking after check
      }

      return baseStyle;
    },
    [selectedOption, isAnswerChecked, currentQuestion],
  );

  // --- RESULT VIEW ---
  if (showResult) {
    const percentage = (score / questionsData.length) * 100;
    const isNewHighScore = score === highScore && score > 0;

    return (
      <div className='flex items-center justify-center p-2'>
        <div className='p-4 md:p-8 rounded-2xl w-full text-center border-t-4 border-indigo-600 transform transition-all duration-500 ease-out scale-100'>
          <h2 className='text-3xl font-extrabold text-indigo-600 mb-3'>
            Quiz Complete!
          </h2>

          <div className='text-xl text-gray-700 mb-4'>
            You scored{' '}
            <span className='text-3xl font-bold text-green-600'>{score}</span>{' '}
            out of {questionsData.length}
          </div>

          <div
            className={`p-3 rounded-xl mb-4 flex justify-center items-center shadow-inner ${isNewHighScore ? 'bg-yellow-100 border border-yellow-400' : 'bg-gray-100 border border-gray-300'}`}
          >
            <Star
              className={`w-5 h-5 mr-3 ${isNewHighScore ? 'text-yellow-500 animate-bounce' : 'text-gray-500'}`}
            />
            <span className='font-bold text-lg text-gray-800'>
              High Score: {highScore} {isNewHighScore && '(New Record!)'}
            </span>
          </div>

          <div className='text-lg text-gray-600 mb-6'>
            <p>
              Success Rate:{' '}
              <span
                className={`font-bold ${percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}
              >
                {percentage.toFixed(0)}%
              </span>
            </p>
          </div>

          <button
            onClick={handleRestartQuiz}
            className='flex items-center justify-center mx-auto px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  return (
    <div className='p-2'>
      <div className='bg-white rounded-xl'>
        {/* Header (Title, Score, Progress) */}
        <div className='mb-4 border-b pb-3'>
          <div className='flex justify-between items-center mb-2'>
            <h1 className='text-xl font-bold text-gray-800 flex items-center'>
              <Shield className='w-5 h-5 text-indigo-500 mr-2' />
              Knowledge Quiz
            </h1>
            <div className='flex items-center text-base font-semibold text-gray-700'>
              <Zap className='w-4 h-4 text-yellow-500 mr-1' />
              Score: {score}
            </div>
          </div>
          <p className='text-sm text-gray-500'>
            Question {currentQuestionIndex + 1} of {questionsData.length}
          </p>
          {/* Progress Bar */}
          <div className='mt-2 bg-gray-200 rounded-full h-2'>
            <div
              className='bg-indigo-500 h-2 rounded-full transition-all duration-500'
              style={{
                width: `${((currentQuestionIndex + (isAnswerChecked ? 1 : 0)) / questionsData.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <div className='bg-indigo-50 p-3 rounded-lg mb-4 shadow-inner'>
          <p className='text-base font-medium text-gray-900'>
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className='space-y-3 mb-4'>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={getOptionStyle(option)}
              onClick={() => handleOptionClick(option)}
              aria-pressed={selectedOption === option}
              disabled={isAnswerChecked}
            >
              <span className='font-medium text-sm'>{option}</span>
            </button>
          ))}
        </div>

        {/* Answer Status Message */}
        {isAnswerChecked && (
          <div
            className={`p-2 rounded-lg mb-4 flex items-center shadow-md text-sm ${selectedOption === currentQuestion.answer ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}
          >
            {selectedOption === currentQuestion.answer ? (
              <CheckCircle className='w-4 h-4 mr-2' />
            ) : (
              <XCircle className='w-4 h-4 mr-2' />
            )}
            <span className='font-semibold'>
              {selectedOption === currentQuestion.answer
                ? 'Correct! Well done.'
                : `Incorrect. The correct answer was: ${currentQuestion.answer}`}
            </span>
          </div>
        )}

        {/* Control Buttons */}
        <div className='flex justify-between gap-3 pt-3 border-t'>
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption || isAnswerChecked}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition duration-300 shadow-md ${
              selectedOption && !isAnswerChecked
                ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            Check
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!isAnswerChecked}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition duration-300 shadow-md ${
              isAnswerChecked
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === questionsData.length - 1
              ? 'View Result'
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// MAIN APP COMPONENT (Refactored from SuraDashboard)
// =================================================================

export default function App() {
  // Mocked hooks are used.
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('Student');
  const [selectedSura, setSelectedSura] = useState(suraData[0]);
  const [activeSection, setActiveSection] = useState('dashboard');

  const [loading, setLoading] = useState(true);
  // Tracks video interaction
  const [hasUserInteractedWithVideo, setHasUserInteractedWithVideo] =
    useState(false);
  const [suraNote, setSuraNote] = useState('');
  const [suraCompletionStatus, setSuraCompletionStatus] = useState({});

  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Video container reference
  const videoContainerRef = useRef(null);

  // Memoize storage keys as they are dependencies in useEffects
  const NOTE_STORAGE_KEY = `suraNote_${studentId}_${selectedSura.id}`;
  const COMPLETION_STORAGE_KEY = `suraCompletionStatus_${studentId}`;

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('profileImage') || '',
  );

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem('profileImage', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 1. Hook: Fetch Student Name (MOCKED)
  useEffect(() => {
    async function fetchStudentName() {
      // Mocked Firebase call:
      setLoading(false);
      // The real Firebase code will go here.
    }
    fetchStudentName();
  }, [studentId]);

  // 2. Hook: Load Note from Local Storage
  useEffect(() => {
    const savedNote = localStorage.getItem(NOTE_STORAGE_KEY) || '';
    setSuraNote(savedNote);
  }, [NOTE_STORAGE_KEY]);

  // 3. Hook: Load Completion Status from Local Storage
  useEffect(() => {
    if (studentId) {
      const savedStatus = localStorage.getItem(COMPLETION_STORAGE_KEY);
      if (savedStatus) {
        setSuraCompletionStatus(JSON.parse(savedStatus));
      }
    }
  }, [studentId, COMPLETION_STORAGE_KEY]);

  // Reset user interaction state when Sura changes
  useEffect(() => {
    setHasUserInteractedWithVideo(false);
  }, [selectedSura]);

  // Function to save the note
  const handleSaveNote = useCallback(() => {
    try {
      localStorage.setItem(NOTE_STORAGE_KEY, suraNote);
      console.log(`Notes for "${selectedSura.name}" successfully saved!`);
    } catch (error) {
      console.error('Note saving error:', error);
      // In a real app, show a user-friendly message here
    }
  }, [NOTE_STORAGE_KEY, suraNote, selectedSura.name]);

  // Function to toggle completion status
  const handleToggleCompletion = useCallback(
    (suraId) => {
      const suraIdStr = String(suraId);

      setSuraCompletionStatus((prevStatus) => {
        const newStatus = !prevStatus[suraIdStr];
        const updatedStatus = {
          ...prevStatus,
          [suraIdStr]: newStatus,
        };

        // Save to LocalStorage
        try {
          localStorage.setItem(
            COMPLETION_STORAGE_KEY,
            JSON.stringify(updatedStatus),
          );
          console.log(
            `"${suraData.find((s) => s.id === suraId).name}" marked as ${newStatus ? 'MEMORIZED' : 'NOT MEMORIZED'}.`,
          );
        } catch (error) {
          console.error('Completion status saving error:', error);
        }

        return updatedStatus;
      });
    },
    [COMPLETION_STORAGE_KEY],
  );

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSelectSura = (sura) => {
    setSelectedSura(sura);
    setIsMenuOpen(false); // Close mobile menu
  };

  // Function to navigate to a section from the mobile menu (simulating real navigation/scrolling)
  const handleNavigateToSection = (sectionName) => {
    console.log(`Go to section: ${sectionName}`);
    setIsMenuOpen(false); // Close mobile menu
    // Real scrolling logic would go here.
  };

  // Function to handle Overlay click
  const handleOverlayClick = () => {
    setHasUserInteractedWithVideo(true);

    // Scroll the video container to the top
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center text-xl text-indigo-600 bg-gray-50'>
        Dashboard is Loading... ⏳
      </div>
    );
  }

  const currentVideoUrl = getEmbedUrl(selectedSura.videoUrl);

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans'>
      <style>{`
        /* Custom font-family for Arabic script */
        .font-arabic {
          font-family: 'Noto Kufi Arabic', 'Amiri', 'Traditional Arabic', serif;
          direction: rtl;
        }
      `}</style>

      {/* Mobile Top Bar and Hamburger Menu Button */}
      <header className='flex justify-between items-center p-4 bg-white shadow-lg md:hidden sticky top-0 z-40 w-full'>
        <div className='flex items-center space-x-2'>
          <HiUserCircle className='w-8 h-8 text-indigo-600' />
          <h1 className='text-lg font-bold text-gray-800 truncate'>
            {studentName} Dashboard
          </h1>
        </div>
        <button
          onClick={toggleMenu}
          className='p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          aria-label='Open menu'
        >
          <HiMenu className='w-6 h-6' />
        </button>
      </header>

      {/* Mobile Menu Background (Overlay) */}
      {isMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
          onClick={toggleMenu}
        ></div>
      )}

      {/* Aside Navigation Panel - Sliding drawer for mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-72 bg-white shadow-xl p-4 md:p-6 border-r border-gray-200 z-50 transform 
          transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-screen md:w-72 md:overflow-y-auto
        `}
      >
        {/* Mobile Menu Close Button */}
        <div className='md:hidden flex justify-end mb-4'>
          <button
            onClick={toggleMenu}
            className='p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            aria-label='Close menu'
          >
            <HiX className='w-6 h-6' />
          </button>
        </div>

        {/* Profile and Title */}

        {/* Profile and Title */}
        <div className='flex items-center space-x-3 mb-6 p-3 bg-indigo-100/50 rounded-xl'>
          <label htmlFor='profile-upload' className='relative cursor-pointer'>
            <img
              src={profileImage || '/images/default-avatar.png'}
              alt='Profile'
              className='w-12 h-12 rounded-full object-cover border-2 border-indigo-500 hover:opacity-90 transition'
            />
            <input
              id='profile-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleProfileUpload}
            />
          </label>

          <div>
            <h2 className='text-xl font-bold text-gray-800 truncate'>
              {studentName}
            </h2>
            <p className='text-sm text-indigo-500'>Memorization Panel</p>
          </div>
        </div>

        {/* Sura Navigation */}
        <div className='mt-8'>
          <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center'>
            <HiBookOpen className='w-4 h-4 mr-2 text-indigo-500' />
            Prayer Du'as and Surahs
          </h3>
          <nav className='space-y-1'>
            {suraData.map((sura) => {
              const isCompleted = !!suraCompletionStatus[sura.id];

              return (
                <button
                  key={sura.id}
                  onClick={() => handleSelectSura(sura)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl text-left transition duration-150 ease-in-out ${
                    selectedSura.id === sura.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-md ring-2 ring-indigo-400'
                      : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  <span className='text-sm flex items-center'>
                    {isCompleted && (
                      <HiCheckCircle className='w-4 h-4 mr-2 text-green-600' />
                    )}
                    {sura.name}
                  </span>
                  <HiPlay className='w-4 h-4 ml-2' />
                </button>
              );
            })}
          </nav>
        </div>

        {/* NEW SECTION: Quiz and Daily Tasks */}
        <div className='mt-8'>
          <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center'>
            <HiStar className='w-4 h-4 mr-2 text-yellow-500' />
            Daily Tasks & Quizzes
          </h3>
          <nav className='space-y-1'>
            {/* Quiz link */}
            <button
              onClick={() => handleNavigateToSection('Quiz')}
              className='flex items-center justify-between w-full p-3 rounded-xl text-left transition text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            >
              <span className='text-sm flex items-center'>
                <HiStar className='w-4 h-4 mr-2 text-yellow-500/80' />
                Knowledge Quiz
              </span>
            </button>
            {/* Daily Tracker link */}
            {/* Daily Tracker link */}
            <button
              onClick={() => {
                setActiveSection('dailyProgress');
                setIsMenuOpen(false); // auto-close menu on mobile
              }}
              className={`flex items-center justify-between w-full p-3 rounded-xl text-left transition ${
                activeSection === 'dailyProgress'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              } md:static fixed bottom-20 left-4 right-4 md:left-0 md:right-0 z-50 shadow-lg md:shadow-none`}
            >
              <span className='text-sm flex items-center'>
                <HiBookOpen className='w-4 h-4 mr-2 text-indigo-500/80' />
                Daily Progress
              </span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        {/* FIXED LOGOUT BUTTON FOR MOBILE */}
        <button
          onClick={handleLogout}
          className='fixed bottom-6 right-6 flex items-center justify-center space-x-2 text-red-500 hover:text-white hover:bg-red-600 transition font-medium p-3 rounded-full shadow-lg z-50'
        >
          <HiLogout className='w-5 h-5' />
          <span className='hidden md:inline font-semibold'>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-4 md:p-8 space-y-8 overflow-y-auto'>
        {activeSection === 'dashboard' ? (
          <>
            <h1 className='text-3xl font-extrabold text-gray-800 border-b pb-2 hidden md:block'>
              {selectedSura.name} Recitation and Memorization
            </h1>

            {/* Video and Quiz Area (Desktop Grid) */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* 1. Column: Video Player */}
              <div
                ref={videoContainerRef}
                className='aspect-video bg-gray-900 rounded-xl shadow-2xl overflow-hidden relative'
                style={{ WebkitTransform: 'translateZ(0)' }}
              >
                {/* Show Overlay if there is no user interaction */}
                {hasUserInteractedWithVideo ? (
                  <iframe
                    className='w-full h-full'
                    src={currentVideoUrl}
                    title={`${selectedSura.name} Recitation`}
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                    key={selectedSura.id} // Reset iframe when Surah changes
                    style={{ pointerEvents: 'auto' }}
                  ></iframe>
                ) : (
                  /* CLICKABLE OVERLAY */
                  <div
                    onClick={handleOverlayClick}
                    className='absolute inset-0 flex flex-col items-center justify-center bg-indigo-800 bg-opacity-90 backdrop-blur-sm cursor-pointer z-30 transition hover:bg-opacity-80'
                  >
                    <HiPlay className='w-12 h-12 text-white mb-2 animate-pulse' />
                    <p className='text-white text-lg font-medium'>
                      Tap to Load and Play Video
                    </p>
                    <p className='text-indigo-300 text-sm mt-1'>
                      Clicking enables media playback.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Column: Quiz and Medals */}
              <div
                id='Quiz'
                className='bg-white p-2 rounded-xl shadow-lg border-t-4 border-yellow-500'
              >
                <Quiz
                  studentId={studentId}
                  suraId={selectedSura.id}
                  suraName={selectedSura.name}
                />
              </div>
            </div>

            {/* Surah Information and Memorization Tracking Section */}
            <section className='bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500'>
              <h2 className='text-2xl font-bold text-indigo-600 mb-4'>
                {selectedSura.name} ({selectedSura.turkish})
              </h2>
              <p className='text-gray-600 mb-4 text-sm'>
                Listen to the video, read the text, and track your progress.
              </p>

              <div className='border-t pt-4'>
                <h3 className='text-xl font-semibold text-gray-700 mb-3'>
                  Arabic Text (For Memorization)
                </h3>
                <p className='text-4xl md:text-5xl text-right text-gray-800 leading-relaxed p-4 bg-indigo-50 border border-indigo-200 rounded-xl font-arabic shadow-inner'>
                  {selectedSura.arabic}
                </p>
              </div>

              {/* MEMORIZATION STATUS (Checkbox) */}
              <div className='mt-6 border-t pt-4'>
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                  Memorization Status
                </h3>
                <label className='flex items-center space-x-3 cursor-pointer p-3 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition'>
                  <input
                    type='checkbox'
                    checked={!!suraCompletionStatus[selectedSura.id]}
                    onChange={() => handleToggleCompletion(selectedSura.id)}
                    className='w-5 h-5 text-green-600 bg-white border-gray-300 rounded-full focus:ring-green-500'
                  />
                  <span
                    className={`text-lg font-medium ${
                      suraCompletionStatus[selectedSura.id]
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {selectedSura.name} Memorized / Reading Completed
                  </span>
                </label>
              </div>

              {/* TRACKING NOTES */}
              <div className='mt-6 border-t pt-4'>
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                  Tracking Notes
                </h3>
                <textarea
                  className='w-full h-24 p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner'
                  placeholder={`Write your memorization status or important notes for "${selectedSura.name}" here...`}
                  value={suraNote}
                  onChange={(e) => setSuraNote(e.target.value)}
                ></textarea>
                <button
                  onClick={handleSaveNote}
                  className='mt-3 px-6 py-2 bg-green-600 text-white font-medium rounded-xl shadow-lg hover:bg-green-700 transition flex items-center space-x-2 transform hover:scale-[1.01]'
                >
                  <HiSave className='w-5 h-5' />
                  <span>Save Notes</span>
                </button>
              </div>
            </section>

            {/* 🚀 DAILY TRACKER */}
            <div id='DailyTracker'>
              <DailyTracker />
            </div>
          </>
        ) : (
          <StudentDetail emailKey={studentId} studentId={studentId} />
        )}
      </main>
    </div>
  );
}
