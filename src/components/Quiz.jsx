import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Star,
} from 'lucide-react';

// --- QUIZ DATA ---
const questionsData = [
  {
    id: 1,
    question: 'What is the second pillar of Islam?',
    options: [
      'Fasting (Sawm)',
      'Prayer (Salah)',
      'Pilgrimage (Hajj)',
      'Charity (Zakat)',
    ],
    answer: 'Prayer (Salah)',
  },
  {
    id: 2,
    question: "What is the name of Prophet Muhammad's (PBUH) mother?",
    // Corrected string escaping issue that caused the previous compilation error
    options: ['Halimah', 'Aisha', 'Aminah', 'Khadijah'],
    answer: 'Aminah',
  },
  {
    id: 3,
    question: 'How many Surahs (chapters) are there in the Quran?',
    options: ['110', '114', '120', '116'],
    answer: '114',
  },
  {
    id: 4,
    question: 'In which city is the Kaaba located?',
    options: ['Madinah', 'Jerusalem', 'Makkah', 'Damascus'],
    answer: 'Makkah',
  },
  {
    id: 5,
    question: 'What is the name of the month when Muslims fast?',
    options: ['Shawwal', 'Muharram', 'Rajab', 'Ramadan'],
    answer: 'Ramadan',
  },
];

// --- APP COMPONENT ---
const QuizApp = () => {
  // Component adı 'QuizApp' olarak değiştirildi
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
      <div className='flex items-center justify-center min-h-screen bg-gray-50 p-4'>
        <div className='bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-lg text-center border-t-8 border-indigo-600 transform transition-all duration-500 ease-out scale-100'>
          <h2 className='text-4xl font-extrabold text-indigo-600 mb-4'>
            Quiz Complete!
          </h2>

          <div className='text-xl text-gray-700 mb-8'>
            You scored{' '}
            <span className='text-4xl font-bold text-green-600'>{score}</span>{' '}
            out of {questionsData.length} correct answers.
          </div>

          <div
            className={`p-4 rounded-xl mb-6 flex justify-center items-center shadow-inner ${isNewHighScore ? 'bg-yellow-100 border border-yellow-400' : 'bg-gray-100 border border-gray-300'}`}
          >
            <Star
              className={`w-6 h-6 mr-3 ${isNewHighScore ? 'text-yellow-500 animate-bounce' : 'text-gray-500'}`}
            />
            <span className='font-bold text-lg text-gray-800'>
              High Score: {highScore} {isNewHighScore && '(New Record!)'}
            </span>
          </div>

          <div className='text-lg text-gray-600 mb-10'>
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
            className='flex items-center justify-center mx-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105'
          >
            <RefreshCw className='w-5 h-5 mr-2' />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50 p-4 font-inter'>
      <div className='bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg border-t-8 border-indigo-500'>
        {/* Header (Title, Score, Progress) */}
        <div className='mb-6 border-b pb-4'>
          <div className='flex justify-between items-center mb-2'>
            <h1 className='text-2xl font-bold text-gray-800 flex items-center'>
              <Shield className='w-6 h-6 text-indigo-500 mr-2' />
              Islamic Quiz
            </h1>
            <div className='flex items-center text-lg font-semibold text-gray-700'>
              <Zap className='w-5 h-5 text-yellow-500 mr-1' />
              Score: {score}
            </div>
          </div>
          <p className='text-sm text-gray-500'>
            Question {currentQuestionIndex + 1} of {questionsData.length}
          </p>
          {/* Progress Bar */}
          <div className='mt-3 bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-indigo-500 h-2.5 rounded-full transition-all duration-500'
              style={{
                width: `${((currentQuestionIndex + (isAnswerChecked ? 1 : 0)) / questionsData.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <div className='bg-indigo-50 p-4 rounded-xl mb-6 shadow-inner'>
          <p className='text-lg font-medium text-gray-900'>
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className='space-y-4 mb-6'>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={getOptionStyle(option)}
              onClick={() => handleOptionClick(option)}
              aria-pressed={selectedOption === option}
              disabled={isAnswerChecked}
            >
              <span className='font-medium'>{option}</span>
            </button>
          ))}
        </div>

        {/* Answer Status Message */}
        {isAnswerChecked && (
          <div
            className={`p-3 rounded-xl mb-6 flex items-center shadow-md ${selectedOption === currentQuestion.answer ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}
          >
            {selectedOption === currentQuestion.answer ? (
              <CheckCircle className='w-5 h-5 mr-3' />
            ) : (
              <XCircle className='w-5 h-5 mr-3' />
            )}
            <span className='font-semibold'>
              {selectedOption === currentQuestion.answer
                ? 'Correct! Well done.'
                : `Incorrect. The correct answer was: ${currentQuestion.answer}`}
            </span>
          </div>
        )}

        {/* Control Buttons */}
        <div className='flex justify-between gap-4 pt-4 border-t'>
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption || isAnswerChecked}
            className={`px-6 py-3 font-semibold rounded-xl transition duration-300 shadow-md ${
              selectedOption && !isAnswerChecked
                ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!isAnswerChecked}
            className={`px-6 py-3 font-semibold rounded-xl transition duration-300 shadow-md ${
              isAnswerChecked
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === questionsData.length - 1
              ? 'View Result'
              : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp; // Dışa aktarma adı 'QuizApp' olarak güncellendi
