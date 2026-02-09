import { useState, useEffect, useCallback, useRef } from 'react';
import { UserDetails } from '../types';
import { quiz2Questions, QUIZ2_TIME_LIMIT_SECONDS, QUIZ2_PASSAGE } from '../data/quiz2questions';

interface Quiz2InterfaceProps {
  userDetails: UserDetails;
  onComplete: (answers: Record<number, string>, timeSpent: number) => void;
  onKickedOut: () => void;
  attemptId: string;
}

export default function Quiz2Interface({ userDetails, onComplete, onKickedOut, attemptId }: Quiz2InterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(QUIZ2_TIME_LIMIT_SECONDS);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showPassage, setShowPassage] = useState(true);
  const tabSwitchRef = useRef(0);

  // ==================== ANTI-CHEAT SYSTEM ====================

  const updateFlagInStorage = useCallback((switchCount: number, reason: string) => {
    const attempts = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const idx = attempts.findIndex((a: any) => a.id === attemptId);
    if (idx !== -1) {
      const existing: string[] = attempts[idx].flagReasons || [];
      if (!existing.includes(reason)) {
        existing.push(reason);
      }
      attempts[idx].tabSwitchCount = switchCount;
      attempts[idx].isFlagged = true;
      attempts[idx].flagReasons = existing;
      localStorage.setItem('quiz2Attempts', JSON.stringify(attempts));
      window.dispatchEvent(new Event('storage'));
    }
  }, [attemptId]);

  // Disable copy, cut, paste, right-click, text selection, keyboard shortcuts
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
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'a', 'u', 's', 'p'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
        showAntiCheatWarning('Keyboard shortcuts are disabled during the quiz!');
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey)) {
          updateFlagInStorage(tabSwitchRef.current, 'Attempted to open DevTools');
        }
      }
    };
    const preventDragStart = (e: Event) => { e.preventDefault(); };

    document.addEventListener('copy', preventAction);
    document.addEventListener('cut', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyShortcuts);
    document.addEventListener('dragstart', preventDragStart);
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

  // Tab switch / window blur detection
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

  const showAntiCheatWarning = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  // ==================== QUIZ LOGIC ====================

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => {
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

  // Check for quiz lock and user deletion
  useEffect(() => {
    const checkStatus = setInterval(() => {
      const lockStatus = localStorage.getItem('quiz2Locked');
      if (lockStatus === 'true') {
        onKickedOut();
        return;
      }
      const attempts = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
      const myAttempt = attempts.find((a: any) => a.id === attemptId);
      if (!myAttempt) {
        onKickedOut();
        return;
      }
    }, 1000);
    return () => clearInterval(checkStatus);
  }, [attemptId, onKickedOut]);

  // Update localStorage with current progress
  useEffect(() => {
    const attempts = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const attemptIndex = attempts.findIndex((a: any) => a.id === attemptId);
    if (attemptIndex !== -1) {
      attempts[attemptIndex] = {
        ...attempts[attemptIndex],
        answers,
        currentQuestion: currentQuestionIndex,
        timeSpentSeconds: QUIZ2_TIME_LIMIT_SECONDS - timeRemaining
      };
      localStorage.setItem('quiz2Attempts', JSON.stringify(attempts));
      window.dispatchEvent(new Event('storage'));
    }
  }, [answers, currentQuestionIndex, timeRemaining, attemptId]);

  useEffect(() => {
    const savedAnswer = answers[quiz2Questions[currentQuestionIndex].id];
    setSelectedOption(savedAnswer || '');
  }, [currentQuestionIndex, answers]);

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const timeSpent = QUIZ2_TIME_LIMIT_SECONDS - timeRemaining;
      onComplete(answers, timeSpent);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => { setSelectedOption(option); };

  const handleNext = () => {
    if (selectedOption) {
      setAnswers((prev: Record<number, string>) => ({ ...prev, [quiz2Questions[currentQuestionIndex].id]: selectedOption }));
    }
    if (currentQuestionIndex < quiz2Questions.length - 1) {
      setCurrentQuestionIndex((prev: number) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev: number) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setAnswers((prev: Record<number, string>) => ({ ...prev, [quiz2Questions[currentQuestionIndex].id]: selectedOption }));
    }
    setIsSubmitting(true);
    const timeSpent = QUIZ2_TIME_LIMIT_SECONDS - timeRemaining;
    setTimeout(() => { onComplete(answers, timeSpent); }, 100);
  };

  const currentQuestion = quiz2Questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz2Questions.length) * 100;
  const isLowTime = timeRemaining < 120; // Less than 2 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 select-none" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
      
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

      {/* Tab Switch Counter */}
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

      <div className="max-w-6xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 sticky top-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{userDetails.fullName}</h2>
              <p className="text-sm text-emerald-600 font-medium">Reading Comprehension Quiz</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPassage(!showPassage)}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                {showPassage ? 'Hide Passage' : 'Show Passage'}
              </button>
              <div className={`text-right ${isLowTime ? 'animate-pulse' : ''}`}>
                <div className={`text-3xl font-bold ${isLowTime ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Time Remaining</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center font-medium">
              Question {currentQuestionIndex + 1} of {quiz2Questions.length}
            </p>
          </div>
        </div>

        <div className={`grid ${showPassage ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'} gap-6`}>
          {/* Passage Panel */}
          {showPassage && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-fit lg:sticky lg:top-32">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Reading Passage
                </h3>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-gray-800 leading-relaxed text-[15px]">{QUIZ2_PASSAGE}</p>
              </div>
            </div>
          )}

          {/* Question Panel */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-3">
                  Question {currentQuestionIndex + 1}
                </span>
                <h3 className="text-xl font-semibold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionLabel = String.fromCharCode(65 + index);
                    const isSelected = selectedOption === option;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.01] ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3 text-sm ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {optionLabel}
                          </div>
                          <span className={`flex-1 text-sm ${isSelected ? 'text-emerald-900 font-medium' : 'text-gray-700'}`}>
                            {option}
                          </span>
                          {isSelected && (
                            <svg className="w-5 h-5 text-emerald-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  {quiz2Questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full ${
                        idx === currentQuestionIndex ? 'bg-emerald-600 w-8' : answers[quiz2Questions[idx].id] ? 'bg-green-500' : 'bg-gray-300'
                      } transition-all`}
                    />
                  ))}
                </div>

                {currentQuestionIndex === quiz2Questions.length - 1 ? (
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
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
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
                {quiz2Questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
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
                Answered: {Object.keys(answers).length} / {quiz2Questions.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
