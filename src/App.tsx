import { useState, useEffect } from 'react';
import './App.css';
import { QuizAttempt, UserDetails } from './types';
import { authenticateUser, isUserBanned, hasUserCompletedQuiz, registeredUsers, banUser, unbanUser } from './data/users';
import { isQuiz2UserApproved, banQuiz2User, unbanQuiz2User } from './data/quiz2users';
import { quizQuestions } from './data/questions';
import { quiz2Questions } from './data/quiz2questions';
import RegistrationForm from './components/RegistrationForm';
import QuizInterface from './components/QuizInterface';
import Quiz2Interface from './components/Quiz2Interface';
import ResultsPage from './components/ResultsPage';
import QuizLockedPage from './components/QuizLockedPage';
import KickedOutPage from './components/KickedOutPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

const ADMIN_CREDENTIALS = { email: 'admin@quiz.com', password: 'admin123' };

type AppView =
  | 'quiz1-home' | 'quiz1-register' | 'quiz1-play' | 'quiz1-results'
  | 'quiz2-waiting' | 'quiz2-register' | 'quiz2-play' | 'quiz2-results'
  | 'kicked-out';

function App() {
  // ── View state ──
  const [view, setView] = useState<AppView>('quiz1-home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  // ── Quiz shared state ──
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [currentAttemptId, setCurrentAttemptId] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  // ── Quiz 1 state ──
  const [quiz1Attempts, setQuiz1Attempts] = useState<QuizAttempt[]>([]);
  const [isQuiz1Locked, setIsQuiz1Locked] = useState(false);

  // ── Quiz 2 state ──
  const [quiz2Attempts, setQuiz2Attempts] = useState<QuizAttempt[]>([]);
  const [isQuiz2Locked, setIsQuiz2Locked] = useState(false);

  // ── Load from localStorage ──
  useEffect(() => {
    const s1 = localStorage.getItem('quizAttempts');
    if (s1) setQuiz1Attempts(JSON.parse(s1));
    const s2 = localStorage.getItem('quiz2Attempts');
    if (s2) setQuiz2Attempts(JSON.parse(s2));
    if (localStorage.getItem('quizLocked') === 'true') setIsQuiz1Locked(true);
    if (localStorage.getItem('quiz2Locked') === 'true') setIsQuiz2Locked(true);
  }, []);

  // ── Helpers ──
  const resetQuizState = () => {
    setUserDetails(null);
    setCurrentAnswers({});
    setCurrentAttemptId('');
    setAuthError('');
    setCurrentUserId('');
  };

  // ══════════════════════════════════════
  //  QUIZ 1 HANDLERS
  // ══════════════════════════════════════
  const handleQuiz1Login = (accessCode: string) => {
    const user = authenticateUser(accessCode);
    if (!user) {
      const found = registeredUsers.find(u => u.accessCode === accessCode.toUpperCase());
      if (found && isUserBanned(found.id)) {
        setAuthError('Your access has been permanently revoked by the administrator.');
      } else {
        setAuthError('Invalid access code. Please check and try again.');
      }
      return;
    }
    if (hasUserCompletedQuiz(user.id)) {
      // Already completed Quiz 1 → go to Quiz 2 waiting
      setCurrentUserId(user.id);
      setUserDetails({ fullName: user.name, collegeName: '', email: '', phoneNumber: '' });
      setAuthError('');
      setView('quiz2-waiting');
      return;
    }
    if (isQuiz1Locked) {
      setAuthError('The quiz is currently locked. Please wait for the administrator to unlock it.');
      return;
    }
    // Check for in-progress attempt
    const existing: QuizAttempt[] = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const inProgress = existing.find(a => a.registeredUserId === user.id && a.status === 'in-progress');
    if (inProgress) {
      setUserDetails(inProgress.userDetails);
      setCurrentAttemptId(inProgress.id);
      setCurrentAnswers(inProgress.answers || {});
      setCurrentUserId(user.id);
      setAuthError('');
      setView('quiz1-play');
      return;
    }
    // New attempt
    setAuthError('');
    const details: UserDetails = { fullName: user.name, collegeName: '', email: '', phoneNumber: '' };
    setUserDetails(details);
    setCurrentUserId(user.id);
    const attemptId = Date.now().toString();
    const newAttempt: QuizAttempt = {
      id: attemptId, registeredUserId: user.id, userDetails: details,
      answers: {}, score: 0, totalQuestions: quizQuestions.length,
      timeSpentSeconds: 0, submittedAt: '', status: 'in-progress',
      currentQuestion: 0, startedAt: new Date().toISOString(),
      tabSwitchCount: 0, isFlagged: false, flagReasons: []
    };
    const fresh: QuizAttempt[] = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const updated = [...fresh, newAttempt];
    setQuiz1Attempts(updated);
    localStorage.setItem('quizAttempts', JSON.stringify(updated));
    setCurrentAttemptId(attemptId);
    setView('quiz1-play');
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuiz1Complete = (answers: Record<number, string>, timeSpent: number) => {
    setCurrentAnswers(answers);
    const score = calcScore1(answers);
    const updated = quiz1Attempts.map(a =>
      a.id === currentAttemptId
        ? { ...a, answers, score, timeSpentSeconds: timeSpent, submittedAt: new Date().toISOString(), status: 'completed' as const }
        : a
    );
    setQuiz1Attempts(updated);
    localStorage.setItem('quizAttempts', JSON.stringify(updated));
    setView('quiz1-results');
  };

  const calcScore1 = (answers: Record<number, string>) => {
    let s = 0;
    Object.entries(answers).forEach(([qId, ans]) => {
      const q = quizQuestions.find(x => x.id === parseInt(qId));
      if (q && q.correctAnswer === ans) s++;
    });
    return s;
  };

  // ══════════════════════════════════════
  //  QUIZ 2 HANDLERS
  // ══════════════════════════════════════
  const handleQuiz2Login = (accessCode: string) => {
    const user = authenticateUser(accessCode);
    if (!user) {
      const found = registeredUsers.find(u => u.accessCode === accessCode.toUpperCase());
      if (found && isUserBanned(found.id)) {
        setAuthError('Your access has been permanently revoked by the administrator.');
      } else {
        setAuthError('Invalid access code. Please check and try again.');
      }
      return;
    }
    if (!hasUserCompletedQuiz(user.id)) {
      setAuthError('You must complete Quiz 1 first before you can access Quiz 2.');
      return;
    }
    const existingQ2: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    if (existingQ2.some(a => a.registeredUserId === user.id && a.status === 'completed')) {
      setAuthError('You have already completed Quiz 2.');
      return;
    }
    if (!isQuiz2UserApproved(user.id)) {
      setAuthError('Your access has not been approved yet. Please wait for the administrator.');
      return;
    }
    if (isQuiz2Locked) {
      setAuthError('Quiz 2 is currently locked. Please wait for the administrator to unlock it.');
      return;
    }
    // Check in-progress
    const inProgress = existingQ2.find(a => a.registeredUserId === user.id && a.status === 'in-progress');
    if (inProgress) {
      setUserDetails(inProgress.userDetails);
      setCurrentAttemptId(inProgress.id);
      setCurrentAnswers(inProgress.answers || {});
      setCurrentUserId(user.id);
      setAuthError('');
      setView('quiz2-play');
      return;
    }
    setAuthError('');
    const details: UserDetails = { fullName: user.name, collegeName: '', email: '', phoneNumber: '' };
    setUserDetails(details);
    setCurrentUserId(user.id);
    const attemptId = Date.now().toString();
    const newAttempt: QuizAttempt = {
      id: attemptId, registeredUserId: user.id, userDetails: details,
      answers: {}, score: 0, totalQuestions: quiz2Questions.length,
      timeSpentSeconds: 0, submittedAt: '', status: 'in-progress',
      currentQuestion: 0, startedAt: new Date().toISOString(),
      tabSwitchCount: 0, isFlagged: false, flagReasons: []
    };
    const fresh: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const updated = [...fresh, newAttempt];
    setQuiz2Attempts(updated);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updated));
    setCurrentAttemptId(attemptId);
    setView('quiz2-play');
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuiz2Complete = (answers: Record<number, string>, timeSpent: number) => {
    setCurrentAnswers(answers);
    const score = calcScore2(answers);
    const updated = quiz2Attempts.map(a =>
      a.id === currentAttemptId
        ? { ...a, answers, score, timeSpentSeconds: timeSpent, submittedAt: new Date().toISOString(), status: 'completed' as const }
        : a
    );
    setQuiz2Attempts(updated);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updated));
    setView('quiz2-results');
  };

  const calcScore2 = (answers: Record<number, string>) => {
    let s = 0;
    Object.entries(answers).forEach(([qId, ans]) => {
      const q = quiz2Questions.find(x => x.id === parseInt(qId));
      if (q && q.correctAnswer === ans) s++;
    });
    return s;
  };

  // ══════════════════════════════════════
  //  ADMIN HANDLERS
  // ══════════════════════════════════════
  const handleAdminLogin = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuth(true);
      return true;
    }
    return false;
  };

  const handleDeleteQ1 = (id: string) => {
    const current: QuizAttempt[] = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const toDelete = current.find(a => a.id === id);
    if (toDelete?.registeredUserId) banUser(toDelete.registeredUserId);
    const updated = current.filter(a => a.id !== id);
    setQuiz1Attempts(updated);
    localStorage.setItem('quizAttempts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteQ2 = (id: string) => {
    const current: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const toDelete = current.find(a => a.id === id);
    if (toDelete?.registeredUserId) banQuiz2User(toDelete.registeredUserId);
    const updated = current.filter(a => a.id !== id);
    setQuiz2Attempts(updated);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleQ1Lock = () => {
    const n = !isQuiz1Locked;
    setIsQuiz1Locked(n);
    localStorage.setItem('quizLocked', n.toString());
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleQ2Lock = () => {
    const n = !isQuiz2Locked;
    setIsQuiz2Locked(n);
    localStorage.setItem('quiz2Locked', n.toString());
    window.dispatchEvent(new Event('storage'));
  };

  // ══════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════
  const renderMainView = () => {
    switch (view) {
      case 'quiz1-register':
        if (isQuiz1Locked) return <QuizLockedPage onReturnHome={() => { resetQuizState(); setView('quiz1-home'); }} />;
        return <RegistrationForm onSubmit={handleQuiz1Login} errorMessage={authError} />;

      case 'quiz1-play':
        return userDetails ? (
          <QuizInterface userDetails={userDetails} onComplete={handleQuiz1Complete} onKickedOut={() => setView('kicked-out')} attemptId={currentAttemptId} />
        ) : null;

      case 'quiz1-results':
        if (!userDetails) return null;
        return (
          <ResultsPage
            userDetails={userDetails}
            score={calcScore1(currentAnswers)}
            totalQuestions={quizQuestions.length}
            timeSpent={quiz1Attempts.find(a => a.id === currentAttemptId)?.timeSpentSeconds || 0}
            onReturnHome={() => { resetQuizState(); setView('quiz2-waiting'); }}
          />
        );

      case 'quiz2-waiting':
        return <Quiz2WaitingPage onProceed={() => { setAuthError(''); setView('quiz2-register'); }} onGoHome={() => { resetQuizState(); setView('quiz1-home'); }} userId={currentUserId} />;

      case 'quiz2-register':
        if (isQuiz2Locked) return <QuizLockedPage onReturnHome={() => { resetQuizState(); setView('quiz1-home'); }} />;
        return <RegistrationForm onSubmit={handleQuiz2Login} errorMessage={authError} />;

      case 'quiz2-play':
        return userDetails ? (
          <Quiz2Interface userDetails={userDetails} onComplete={handleQuiz2Complete} onKickedOut={() => setView('kicked-out')} attemptId={currentAttemptId} />
        ) : null;

      case 'quiz2-results':
        if (!userDetails) return null;
        return (
          <ResultsPage
            userDetails={userDetails}
            score={calcScore2(currentAnswers)}
            totalQuestions={quiz2Questions.length}
            timeSpent={quiz2Attempts.find(a => a.id === currentAttemptId)?.timeSpentSeconds || 0}
            onReturnHome={() => { resetQuizState(); setView('quiz1-home'); }}
          />
        );

      case 'kicked-out':
        return <KickedOutPage onReturnHome={() => { resetQuizState(); setView('quiz1-home'); }} />;

      default:
        return <Quiz1HomePage onStartQuiz={() => { setAuthError(''); setView('quiz1-register'); }} isQuizLocked={isQuiz1Locked} />;
    }
  };

  return (
    <>
      {/* Admin Overlay */}
      {showAdmin && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          <div className="h-full overflow-auto">
            {isAdminAuth ? (
              <AdminDashboard
                attempts={quiz1Attempts}
                onLogout={() => { setIsAdminAuth(false); setShowAdmin(false); }}
                onDeleteAttempt={handleDeleteQ1}
                onUnbanUser={(uid) => { unbanUser(uid); window.dispatchEvent(new Event('storage')); }}
                isQuizLocked={isQuiz1Locked}
                onToggleQuizLock={handleToggleQ1Lock}
                quiz2Attempts={quiz2Attempts}
                onDeleteQuiz2Attempt={handleDeleteQ2}
                onUnbanQuiz2User={(uid) => { unbanQuiz2User(uid); window.dispatchEvent(new Event('storage')); }}
                isQuiz2Locked={isQuiz2Locked}
                onToggleQuiz2Lock={handleToggleQ2Lock}
              />
            ) : (
              <div className="min-h-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-md">
                  <button
                    onClick={() => setShowAdmin(false)}
                    className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <AdminLogin onLogin={handleAdminLogin} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Floating Icon */}
      {!showAdmin && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 backdrop-blur-sm group"
          title="Admin Panel"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      {renderMainView()}
    </>
  );
}

// ═══════════════════════════════════════════
//  QUIZ 1 HOME PAGE
// ═══════════════════════════════════════════
function Quiz1HomePage({ onStartQuiz, isQuizLocked }: { onStartQuiz: () => void; isQuizLocked: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
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
          <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Business Analytics Quiz</h1>
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
              isQuizLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-2xl hover:-translate-y-1'
            }`}
          >
            {isQuizLocked ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Quiz Currently Locked
              </span>
            ) : 'Start Quiz Now'}
          </button>
          <p className="text-center text-gray-500 text-sm mt-6">
            {isQuizLocked ? 'The quiz is temporarily unavailable. Please contact the administrator.' : 'Complete the quiz to receive instant results and detailed analytics'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  QUIZ 2 WAITING PAGE
// ═══════════════════════════════════════════
function Quiz2WaitingPage({ onProceed, onGoHome, userId }: { onProceed: () => void; onGoHome: () => void; userId: string }) {
  const [approved, setApproved] = useState(isQuiz2UserApproved(userId));

  useEffect(() => {
    const interval = setInterval(() => {
      setApproved(isQuiz2UserApproved(userId));
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="max-w-lg w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 text-center">
          {approved ? (
            <>
              <div className="inline-block p-4 bg-emerald-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">You're Approved! 🎉</h2>
              <p className="text-gray-600 mb-8">The administrator has approved your access to Quiz 2 — Reading Comprehension. You can proceed now.</p>
              <button
                onClick={onProceed}
                className="w-full font-bold py-4 px-8 rounded-xl text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                Start Quiz 2 Now
              </button>
            </>
          ) : (
            <>
              <div className="inline-block p-4 bg-amber-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Quiz 1 Complete! ✅</h2>
              <p className="text-gray-600 mb-4">Great job! Now please wait for the administrator to approve your access to Quiz 2.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="font-semibold text-sm">Waiting for admin approval...</span>
                </div>
                <p className="text-xs text-amber-600 mt-2">This page checks automatically every 2 seconds. Stay here.</p>
              </div>
            </>
          )}
          <button
            onClick={onGoHome}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
