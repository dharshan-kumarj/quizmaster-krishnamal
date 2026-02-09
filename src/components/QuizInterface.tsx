import { useState, useEffect } from 'react';
import { UserDetails } from '../types';
import { quizQuestions, QUIZ_TIME_LIMIT_SECONDS } from '../data/questions';

interface QuizInterfaceProps {
  userDetails: UserDetails;
  onComplete: (answers: Record<number, string>, timeSpent: number) => void;
}

export default function QuizInterface({ userDetails, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
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
