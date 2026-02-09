import { useState, useEffect } from 'react';
import { UserDetails, QuizAttempt } from '../types';
import { quiz2Questions } from '../data/quiz2questions';
import { isQuiz2UserApproved } from '../data/quiz2users';
import { authenticateUser, registeredUsers, isUserBanned, hasUserCompletedQuiz } from '../data/users';
import RegistrationForm from '../components/RegistrationForm';
import Quiz2Interface from '../components/Quiz2Interface';
import ResultsPage from '../components/ResultsPage';
import QuizLockedPage from '../components/QuizLockedPage';
import KickedOutPage from '../components/KickedOutPage';

type QuizView = 'home' | 'registration' | 'quiz' | 'results' | 'kicked-out';

export default function Quiz2Page() {
  const [currentView, setCurrentView] = useState<QuizView>('home');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string>('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const savedAttempts = localStorage.getItem('quiz2Attempts');
    if (savedAttempts) {
      setQuizAttempts(JSON.parse(savedAttempts));
    }
    const lockStatus = localStorage.getItem('quiz2Locked');
    if (lockStatus === 'true') {
      setIsQuizLocked(true);
    }
  }, []);

  const handleAccessCodeSubmit = (accessCode: string) => {
    // Authenticate using Quiz 1 credentials
    const user = authenticateUser(accessCode);
    if (!user) {
      const foundUser = registeredUsers.find(u => u.accessCode === accessCode.toUpperCase());
      if (foundUser && isUserBanned(foundUser.id)) {
        setAuthError('Your access has been permanently revoked by the administrator.');
      } else {
        setAuthError('Invalid access code. Please check and try again.');
      }
      return;
    }

    // Must have completed Quiz 1 first
    if (!hasUserCompletedQuiz(user.id)) {
      setAuthError('You must complete Quiz 1 first before you can access Quiz 2.');
      return;
    }

    // Check if already completed Quiz 2
    const existingQ2: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const alreadyCompleted = existingQ2.some(a => a.registeredUserId === user.id && a.status === 'completed');
    if (alreadyCompleted) {
      setAuthError('You have already completed this quiz. Each participant can only take the quiz once.');
      return;
    }

    // Must be approved by admin for Quiz 2
    if (!isQuiz2UserApproved(user.id)) {
      setAuthError('Your access has not been approved yet. Please wait for the administrator to approve your participation.');
      return;
    }

    if (isQuizLocked) {
      setAuthError('The quiz is currently locked. Please wait for the administrator to unlock it.');
      return;
    }

    const existingAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const inProgressAttempt = existingAttempts.find(a => a.registeredUserId === user.id && a.status === 'in-progress');
    if (inProgressAttempt) {
      const details: UserDetails = inProgressAttempt.userDetails;
      setUserDetails(details);
      setCurrentAttemptId(inProgressAttempt.id);
      setCurrentAnswers(inProgressAttempt.answers || {});
      setAuthError('');
      setCurrentView('quiz');
      return;
    }

    setAuthError('');
    const details: UserDetails = {
      fullName: user.name,
      collegeName: '',
      email: '',
      phoneNumber: ''
    };
    setUserDetails(details);
    
    const attemptId = Date.now().toString();
    const newAttempt: QuizAttempt = {
      id: attemptId,
      registeredUserId: user.id,
      userDetails: details,
      answers: {},
      score: 0,
      totalQuestions: quiz2Questions.length,
      timeSpentSeconds: 0,
      submittedAt: '',
      status: 'in-progress',
      currentQuestion: 0,
      startedAt: new Date().toISOString(),
      tabSwitchCount: 0,
      isFlagged: false,
      flagReasons: []
    };
    
    const freshAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const updatedAttempts = [...freshAttempts, newAttempt];
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updatedAttempts));
    setCurrentAttemptId(attemptId);
    setCurrentView('quiz');
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuizComplete = (answers: Record<number, string>, timeSpent: number) => {
    setCurrentAnswers(answers);
    const score = calculateScore(answers);
    
    const updatedAttempts = quizAttempts.map(attempt => 
      attempt.id === currentAttemptId 
        ? { ...attempt, answers, score, timeSpentSeconds: timeSpent, submittedAt: new Date().toISOString(), status: 'completed' as const }
        : attempt
    );
    
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updatedAttempts));
    setCurrentView('results');
  };

  const handleKickedOut = () => { setCurrentView('kicked-out'); };

  const handleReturnHome = () => {
    setUserDetails(null);
    setCurrentAnswers({});
    setCurrentAttemptId('');
    setAuthError('');
    setCurrentView('home');
  };

  const handleKickedOutReturn = () => {
    setUserDetails(null);
    setCurrentAnswers({});
    setCurrentAttemptId('');
    setAuthError('');
    setCurrentView('home');
  };

  const calculateScore = (answers: Record<number, string>) => {
    let score = 0;
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = quiz2Questions.find(q => q.id === parseInt(questionId));
      if (question && question.correctAnswer === answer) score++;
    });
    return score;
  };

  const renderView = () => {
    switch (currentView) {
      case 'registration':
        if (isQuizLocked) {
          return <QuizLockedPage onReturnHome={handleReturnHome} />;
        }
        return <RegistrationForm onSubmit={handleAccessCodeSubmit} errorMessage={authError} />;
      
      case 'quiz':
        return userDetails ? (
          <Quiz2Interface 
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
            totalQuestions={quiz2Questions.length}
            timeSpent={timeSpent}
            onReturnHome={handleReturnHome}
          />
        );
      
      case 'kicked-out':
        return <KickedOutPage onReturnHome={handleKickedOutReturn} />;
      
      default:
        return <Quiz2HomePage onStartQuiz={() => setCurrentView('registration')} isQuizLocked={isQuizLocked} />;
    }
  };

  return <>{renderView()}</>;
}

function Quiz2HomePage({ onStartQuiz, isQuizLocked }: { onStartQuiz: () => void; isQuizLocked: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Reading Comprehension
          </h1>
          <p className="text-2xl text-white/90 mb-2 font-light">Quiz 2 — Special Access</p>
          <p className="text-lg text-white/80">7 Questions • 10 Minutes • Passage-Based</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
              <div className="text-emerald-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-emerald-900">7</p>
              <p className="text-sm text-emerald-700 font-medium">Questions</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl">
              <div className="text-teal-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-teal-900">10</p>
              <p className="text-sm text-teal-700 font-medium">Minutes</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl">
              <div className="text-cyan-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-cyan-900">RC</p>
              <p className="text-sm text-cyan-700 font-medium">Format</p>
            </div>
          </div>

          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📖 About This Quiz</h3>
            <p className="text-gray-700 leading-relaxed">
              This quiz contains a reading passage about international economics and trade agreements. 
              Read the passage carefully and answer the 7 multiple-choice questions based on the passage content.
            </p>
          </div>

          <button
            onClick={onStartQuiz}
            disabled={isQuizLocked}
            className={`w-full font-bold py-5 px-8 rounded-xl text-xl transition-all shadow-xl transform ${
              isQuizLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 hover:shadow-2xl hover:-translate-y-1'
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
              : '🔒 This quiz is restricted to 5 authorized participants only.'}
          </p>
        </div>
      </div>
    </div>
  );
}
