import { useState, useEffect } from 'react';
import { QuizAttempt } from '../types';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@quiz.com',
  password: 'admin123'
};

export default function AdminPage() {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isQuizLocked, setIsQuizLocked] = useState(false);

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

  const handleDeleteAttempt = (id: string) => {
    // Always read fresh from localStorage to avoid stale state
    const currentAttempts: QuizAttempt[] = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    const updatedAttempts = currentAttempts.filter(attempt => attempt.id !== id);
    setQuizAttempts(updatedAttempts);
    localStorage.setItem('quizAttempts', JSON.stringify(updatedAttempts));
    
    // Trigger storage event so other tabs know about deletion
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleQuizLock = () => {
    const newLockStatus = !isQuizLocked;
    setIsQuizLocked(newLockStatus);
    localStorage.setItem('quizLocked', newLockStatus.toString());
    
    // Trigger storage event so other tabs know about lock change
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      {isAdminAuthenticated ? (
        <AdminDashboard 
          attempts={quizAttempts} 
          onLogout={handleAdminLogout} 
          onDeleteAttempt={handleDeleteAttempt}
          isQuizLocked={isQuizLocked}
          onToggleQuizLock={handleToggleQuizLock}
        />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} />
      )}
    </>
  );
}
