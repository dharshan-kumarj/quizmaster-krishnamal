import { useState, useEffect } from 'react';
import { UserDetails, QuizAttempt } from '../types';
import { quizQuestions } from '../data/questions';
import RegistrationForm from '../components/RegistrationForm';
import QuizInterface from '../components/QuizInterface';
import ResultsPage from '../components/ResultsPage';
import QuizLockedPage from '../components/QuizLockedPage';
import KickedOutPage from '../components/KickedOutPage';

type QuizView = 'home' | 'registration' | 'quiz' | 'results' | 'kicked-out';

export default function QuizPage() {
  const [currentView, setCurrentView] = useState<QuizView>('home');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string>('');

  // Load quiz attempts and lock status from localStorage on mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('quizAttempts');
    if (savedAttempts) {
      setQuizAttempts(JSON.parse(savedAttempts));
    }
    const lockStatus = localStorage.getItem('quizLocked');
    if (lockStatus === 'true') {
      setIsQuizLocked(true);
    }
  }, []);

  const handleRegistrationSubmit = (details: UserDetails) => {
    setUserDetails(details);
    
    // Create attempt immediately when user registers
    const attemptId = Date.now().toString();
    const newAttempt: QuizAttempt = {
      id: attemptId,
      userDetails: details,
      answers: {},
      score: 0,
      totalQuestions: quizQuestions.length,
      timeSpentSeconds: 0,
      submittedAt: new Date().toISOString(),
      status: 'in-progress',
      currentQuestion: 0,
      startedAt: new Date().toISOString()
    };
    
    const updatedAttempts = [...quizAttempts, newAttempt];
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quizAttempts', JSON.stringify(updatedAttempts));
    setCurrentAttemptId(attemptId);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (answers: Record<number, string>, timeSpent: number) => {
    setCurrentAnswers(answers);
    
    const score = calculateScore(answers);
    
    // Update the existing attempt instead of creating a new one
    const updatedAttempts = quizAttempts.map(attempt => 
      attempt.id === currentAttemptId 
        ? {
            ...attempt,
            answers,
            score,
            timeSpentSeconds: timeSpent,
            submittedAt: new Date().toISOString(),
            status: 'completed' as const
          }
        : attempt
    );
    
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quizAttempts', JSON.stringify(updatedAttempts));
    setCurrentView('results');
  };

  const handleKickedOut = () => {
    // User was kicked out (quiz locked or deleted)
    setCurrentView('kicked-out');
  };

  const handleReturnHome = () => {
    setUserDetails(null);
    setCurrentAnswers({});
    setCurrentAttemptId('');
    setCurrentView('home');
  };

  const handleKickedOutReturn = () => {
    setUserDetails(null);
    setCurrentAnswers({});
    setCurrentAttemptId('');
    setCurrentView('home');
  };

  const calculateScore = (answers: Record<number, string>) => {
    let score = 0;
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = quizQuestions.find(q => q.id === parseInt(questionId));
      if (question && question.correctAnswer === answer) {
        score++;
      }
    });
    return score;
  };

  const renderView = () => {
    switch (currentView) {
      case 'registration':
        if (isQuizLocked) {
          return <QuizLockedPage onReturnHome={handleReturnHome} />;
        }
        return <RegistrationForm onSubmit={handleRegistrationSubmit} />;
      
      case 'quiz':
        return userDetails ? (
          <QuizInterface 
            userDetails={userDetails} 
            onComplete={handleQuizComplete} 
            onKickedOut={handleKickedOut}
            attemptId={currentAttemptId}
          />
        ) : null;
      
      case 'results':
        if (!userDetails) return null;
        const timeSpent = quizAttempts.find(a => a.id === currentAttemptId)?.timeSpentSeconds || 0;
        return (
          <ResultsPage
            userDetails={userDetails}
            score={calculateScore(currentAnswers)}
            totalQuestions={quizQuestions.length}
            timeSpent={timeSpent}
            onReturnHome={handleReturnHome}
          />
        );
      
      case 'kicked-out':
        return <KickedOutPage onReturnHome={handleKickedOutReturn} />;
      
      default:
        return <HomePage onStartQuiz={() => setCurrentView('registration')} isQuizLocked={isQuizLocked} />;
    }
  };

  return <>{renderView()}</>;
}

function HomePage({ onStartQuiz, isQuizLocked }: { onStartQuiz: () => void; isQuizLocked: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Business Analytics Quiz
          </h1>
          <p className="text-2xl text-white/90 mb-2 font-light">Test Your Knowledge</p>
          <p className="text-lg text-white/80">20 Questions • 20 Minutes • Challenge Yourself</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-blue-900">20</p>
              <p className="text-sm text-blue-700 font-medium">Questions</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="text-purple-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-purple-900">20</p>
              <p className="text-sm text-purple-700 font-medium">Minutes</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
              <div className="text-pink-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-pink-900">MCQ</p>
              <p className="text-sm text-pink-700 font-medium">Format</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Topics Include:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {['KPIs & Metrics', 'Financial Analytics', 'Data Visualization', 'Marketing Analytics', 'Business Intelligence', 'Customer Analytics'].map((topic, idx) => (
                <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStartQuiz}
            disabled={isQuizLocked}
            className={`w-full font-bold py-5 px-8 rounded-xl text-xl transition-all shadow-xl transform ${
              isQuizLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-2xl hover:-translate-y-1'
            }`}
          >
            {isQuizLocked ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Quiz Currently Locked
              </span>
            ) : (
              'Start Quiz Now'
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            {isQuizLocked 
              ? 'The quiz is temporarily unavailable. Please contact the administrator.' 
              : 'Complete the quiz to receive instant results and detailed analytics'}
          </p>
        </div>
      </div>
    </div>
  );
}
