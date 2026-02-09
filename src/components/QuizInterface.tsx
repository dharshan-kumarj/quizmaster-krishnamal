import { useState, useEffect, useCallback, useRef } from 'react';
import { UserDetails } from '../types';
import { quizQuestions, QUIZ_TIME_LIMIT_SECONDS } from '../data/questions';

interface QuizInterfaceProps {
  userDetails: UserDetails;
  onComplete: (answers: Record<number, string>, timeSpent: number) => void;
  onKickedOut: () => void;
  attemptId: string;
}

export default function QuizInterface({ userDetails, onComplete, onKickedOut, attemptId }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const tabSwitchRef = useRef(0);

  // ==================== ANTI-CHEAT SYSTEM ====================

  // Helper: update flag data in localStorage
  const updateFlagInStorage = useCallback((switchCount: number, reason: string) => {
    const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const idx = attempts.findIndex((a: any) => a.id === attemptId);
    if (idx !== -1) {
      const existing: string[] = attempts[idx].flagReasons || [];
      if (!existing.includes(reason)) {
        existing.push(reason);
      }
      attempts[idx].tabSwitchCount = switchCount;
      attempts[idx].isFlagged = true;
      attempts[idx].flagReasons = existing;
      localStorage.setItem('quizAttempts', JSON.stringify(attempts));
      window.dispatchEvent(new Event('storage'));
    }
  }, [attemptId]);

  // 1) Disable copy, cut, paste, right-click, text selection, print-screen
  useEffect(() => {
    const preventAction = (e: Event) => {
      e.preventDefault();
      showAntiCheatWarning('Copy/Paste/Cut is disabled during the quiz!');
    };
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      showAntiCheatWarning('Right-click is disabled during the quiz!');
    };
    const preventKeyShortcuts = (e: KeyboardEvent) => {
      // Block: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12, PrintScreen
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'a', 'u', 's', 'p'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
        showAntiCheatWarning('Keyboard shortcuts are disabled during the quiz!');
        
        // Flag for dev tools attempt
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey)) {
          updateFlagInStorage(tabSwitchRef.current, 'Attempted to open DevTools');
        }
      }
    };
    const preventDragStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventAction);
    document.addEventListener('cut', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyShortcuts);
    document.addEventListener('dragstart', preventDragStart);

    // Disable text selection via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('cut', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyShortcuts);
      document.removeEventListener('dragstart', preventDragStart);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [updateFlagInStorage]);

  // 2) Tab switch / window blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchRef.current += 1;
        setTabSwitchCount(tabSwitchRef.current);
        updateFlagInStorage(tabSwitchRef.current, `Tab switched (count: ${tabSwitchRef.current})`);
        showAntiCheatWarning(`⚠️ Tab switch detected! (${tabSwitchRef.current} time${tabSwitchRef.current > 1 ? 's' : ''}). This has been flagged.`);
      }
    };

    const handleBlur = () => {
      // Also catch window losing focus (e.g. Alt+Tab)
      if (!document.hidden) {
        tabSwitchRef.current += 1;
        setTabSwitchCount(tabSwitchRef.current);
        updateFlagInStorage(tabSwitchRef.current, `Window lost focus (count: ${tabSwitchRef.current})`);
        showAntiCheatWarning(`⚠️ You left the quiz window! (${tabSwitchRef.current} time${tabSwitchRef.current > 1 ? 's' : ''}). This has been flagged.`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [updateFlagInStorage]);

  // Show warning popup
  const showAntiCheatWarning = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  // ==================== EXISTING QUIZ LOGIC ====================

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for quiz lock and user deletion every second
  useEffect(() => {
    const checkStatus = setInterval(() => {
      const lockStatus = localStorage.getItem('quizLocked');
      if (lockStatus === 'true') {
        onKickedOut();
        return;
      }

      const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      const myAttempt = attempts.find((a: any) => a.id === attemptId);
      if (!myAttempt) {
        // User was deleted by admin
        onKickedOut();
        return;
      }
    }, 1000);

    return () => clearInterval(checkStatus);
  }, [attemptId, onKickedOut]);

  // Update localStorage with current progress
  useEffect(() => {
    const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const attemptIndex = attempts.findIndex((a: any) => a.id === attemptId);
    
    if (attemptIndex !== -1) {
      attempts[attemptIndex] = {
        ...attempts[attemptIndex],
        answers,
        currentQuestion: currentQuestionIndex,
        timeSpentSeconds: QUIZ_TIME_LIMIT_SECONDS - timeRemaining
      };
      localStorage.setItem('quizAttempts', JSON.stringify(attempts));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));
    }
  }, [answers, currentQuestionIndex, timeRemaining, attemptId]);

  useEffect(() => {
    const savedAnswer = answers[quizQuestions[currentQuestionIndex].id];
    setSelectedOption(savedAnswer || '');
  }, [currentQuestionIndex, answers]);

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const timeSpent = QUIZ_TIME_LIMIT_SECONDS - timeRemaining;
      onComplete(answers, timeSpent);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      setAnswers(prev => ({
        ...prev,
        [quizQuestions[currentQuestionIndex].id]: selectedOption
      }));
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setAnswers(prev => ({
        ...prev,
        [quizQuestions[currentQuestionIndex].id]: selectedOption
      }));
    }

    setIsSubmitting(true);
    const timeSpent = QUIZ_TIME_LIMIT_SECONDS - timeRemaining;
    setTimeout(() => {
      onComplete(answers, timeSpent);
    }, 100);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 select-none" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
      
      {/* Anti-Cheat Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
          <div className="bg-red-600 text-white py-3 px-6 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
              <svg className="w-6 h-6 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-semibold text-sm">{warningMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Counter (always visible if switched) */}
      {tabSwitchCount > 0 && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-red-100 border-2 border-red-400 rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-red-700">
                ⚠ {tabSwitchCount} flag{tabSwitchCount > 1 ? 's' : ''} raised
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 sticky top-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{userDetails.fullName}</h2>
              <p className="text-sm text-gray-500">{userDetails.email}</p>
            </div>
            <div className={`text-right ${isLowTime ? 'animate-pulse' : ''}`}>
              <div className={`text-3xl font-bold ${isLowTime ? 'text-red-600' : 'text-indigo-600'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Time Remaining</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center font-medium">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-3">
              Question {currentQuestionIndex + 1}
            </span>
            <h3 className="text-2xl font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedOption === option;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {optionLabel}
                      </div>
                      <span className={`flex-1 ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <svg className="w-6 h-6 text-indigo-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 p-6 flex justify-between items-center border-t">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-200"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {quizQuestions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentQuestionIndex
                      ? 'bg-indigo-600 w-8'
                      : answers[quizQuestions[idx].id]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  } transition-all`}
                />
              ))}
            </div>

            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Answer Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Answer Summary</h4>
          <div className="flex flex-wrap gap-2">
            {quizQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Answered: {Object.keys(answers).length} / {quizQuestions.length}
          </p>
        </div>
      </div>
    </div>
  );
}
