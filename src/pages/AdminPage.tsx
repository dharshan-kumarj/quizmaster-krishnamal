import { useState, useEffect } from 'react';
import { QuizAttempt } from '../types';
import { banUser, unbanUser } from '../data/users';
import { banQuiz2User, unbanQuiz2User } from '../data/quiz2users';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@quiz.com',
  password: 'admin123'
};

export default function AdminPage() {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [quiz2Attempts, setQuiz2Attempts] = useState<QuizAttempt[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [isQuiz2Locked, setIsQuiz2Locked] = useState(false);

  // Load quiz attempts and lock status from localStorage on mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('quizAttempts');
    if (savedAttempts) {
      setQuizAttempts(JSON.parse(savedAttempts));
    }
    const saved2Attempts = localStorage.getItem('quiz2Attempts');
    if (saved2Attempts) {
      setQuiz2Attempts(JSON.parse(saved2Attempts));
    }
    const lockStatus = localStorage.getItem('quizLocked');
    if (lockStatus === 'true') {
      setIsQuizLocked(true);
    }
    const lock2Status = localStorage.getItem('quiz2Locked');
    if (lock2Status === 'true') {
      setIsQuiz2Locked(true);
    }
  }, []);

  const handleAdminLogin = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  // Quiz 1 handlers
  const handleDeleteAttempt = (id: string) => {
    const currentAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const attemptToDelete = currentAttempts.find(attempt => attempt.id === id);
    if (attemptToDelete?.registeredUserId) {
      banUser(attemptToDelete.registeredUserId);
    }
    const updatedAttempts = currentAttempts.filter(attempt => attempt.id !== id);
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quizAttempts', JSON.stringify(updatedAttempts));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUnbanUser = (userId: string) => {
    unbanUser(userId);
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleQuizLock = () => {
    const newLockStatus = !isQuizLocked;
    setIsQuizLocked(newLockStatus);
    localStorage.setItem('quizLocked', newLockStatus.toString());
    window.dispatchEvent(new Event('storage'));
  };

  // Quiz 2 handlers
  const handleDeleteQuiz2Attempt = (id: string) => {
    const currentAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
    const attemptToDelete = currentAttempts.find(attempt => attempt.id === id);
    if (attemptToDelete?.registeredUserId) {
      banQuiz2User(attemptToDelete.registeredUserId);
    }
    const updatedAttempts = currentAttempts.filter(attempt => attempt.id !== id);
    setQuiz2Attempts(updatedAttempts);
    localStorage.setItem('quiz2Attempts', JSON.stringify(updatedAttempts));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUnbanQuiz2User = (userId: string) => {
    unbanQuiz2User(userId);
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleQuiz2Lock = () => {
    const newLockStatus = !isQuiz2Locked;
    setIsQuiz2Locked(newLockStatus);
    localStorage.setItem('quiz2Locked', newLockStatus.toString());
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      {isAdminAuthenticated ? (
        <AdminDashboard 
          attempts={quizAttempts} 
          onLogout={handleAdminLogout} 
          onDeleteAttempt={handleDeleteAttempt}
          onUnbanUser={handleUnbanUser}
          isQuizLocked={isQuizLocked}
          onToggleQuizLock={handleToggleQuizLock}
          quiz2Attempts={quiz2Attempts}
          onDeleteQuiz2Attempt={handleDeleteQuiz2Attempt}
          onUnbanQuiz2User={handleUnbanQuiz2User}
          isQuiz2Locked={isQuiz2Locked}
          onToggleQuiz2Lock={handleToggleQuiz2Lock}
        />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} />
      )}
    </>
  );
}
