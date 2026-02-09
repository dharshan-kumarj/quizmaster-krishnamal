import { useState, useEffect } from 'react';
import { QuizAttempt } from '../types';
import { getBannedUsers, RegisteredUser } from '../data/users';
import { getBannedQuiz2Users, Quiz2User, quiz2Users, getApprovedQuiz2UserIds, toggleQuiz2UserApproval, isQuiz2UserBanned } from '../data/quiz2users';

interface AdminDashboardProps {
  attempts: QuizAttempt[];
  onLogout: () => void;
  onDeleteAttempt: (id: string) => void;
  onUnbanUser: (userId: string) => void;
  isQuizLocked: boolean;
  onToggleQuizLock: () => void;
  quiz2Attempts: QuizAttempt[];
  onDeleteQuiz2Attempt: (id: string) => void;
  onUnbanQuiz2User: (userId: string) => void;
  isQuiz2Locked: boolean;
  onToggleQuiz2Lock: () => void;
}

export default function AdminDashboard({ attempts, onLogout, onDeleteAttempt, onUnbanUser, isQuizLocked, onToggleQuizLock, quiz2Attempts, onDeleteQuiz2Attempt, onUnbanQuiz2User, isQuiz2Locked, onToggleQuiz2Lock }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'time'>('date');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [liveAttempts, setLiveAttempts] = useState(attempts);
  const [bannedUsers, setBannedUsers] = useState<RegisteredUser[]>(getBannedUsers());
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quiz1' | 'quiz2'>('quiz1');
  const [liveQuiz2Attempts, setLiveQuiz2Attempts] = useState(quiz2Attempts);
  const [bannedQuiz2Users, setBannedQuiz2Users] = useState<Quiz2User[]>(getBannedQuiz2Users());
  const [approvedQuiz2, setApprovedQuiz2] = useState<string[]>(getApprovedQuiz2UserIds());
  const [approvalConfirm, setApprovalConfirm] = useState<string | null>(null);

  // Auto-refresh from localStorage every second for live updates
  useEffect(() => {
    setLiveAttempts(attempts);
  }, [attempts]);

  useEffect(() => {
    setLiveQuiz2Attempts(quiz2Attempts);
  }, [quiz2Attempts]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const savedAttempts = localStorage.getItem('quizAttempts');
      if (savedAttempts) {
        setLiveAttempts(JSON.parse(savedAttempts));
      }
      const saved2Attempts = localStorage.getItem('quiz2Attempts');
      if (saved2Attempts) {
        setLiveQuiz2Attempts(JSON.parse(saved2Attempts));
      }
      setBannedUsers(getBannedUsers());
      setBannedQuiz2Users(getBannedQuiz2Users());
      setApprovedQuiz2(getApprovedQuiz2UserIds());
    }, 1000);

    // Listen for storage events from other tabs
    const handleStorageChange = () => {
      const savedAttempts = localStorage.getItem('quizAttempts');
      if (savedAttempts) {
        setLiveAttempts(JSON.parse(savedAttempts));
      }
      const saved2Attempts = localStorage.getItem('quiz2Attempts');
      if (saved2Attempts) {
        setLiveQuiz2Attempts(JSON.parse(saved2Attempts));
      }
      setBannedUsers(getBannedUsers());
      setBannedQuiz2Users(getBannedQuiz2Users());
      setApprovedQuiz2(getApprovedQuiz2UserIds());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRestore = (userId: string) => {
    if (restoreConfirm === userId) {
      if (activeTab === 'quiz1') {
        onUnbanUser(userId);
        setBannedUsers(getBannedUsers());
      } else {
        onUnbanQuiz2User(userId);
        setBannedQuiz2Users(getBannedQuiz2Users());
      }
      setRestoreConfirm(null);
    } else {
      setRestoreConfirm(userId);
      setTimeout(() => setRestoreConfirm(null), 3000);
    }
  };

  const handleDeleteActive = (id: string) => {
    if (deleteConfirm === id) {
      if (activeTab === 'quiz1') {
        onDeleteAttempt(id);
      } else {
        onDeleteQuiz2Attempt(id);
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleToggleApproval = (userId: string) => {
    if (approvalConfirm === userId) {
      toggleQuiz2UserApproval(userId);
      setApprovedQuiz2(getApprovedQuiz2UserIds());
      setApprovalConfirm(null);
      window.dispatchEvent(new Event('storage'));
    } else {
      setApprovalConfirm(userId);
      setTimeout(() => setApprovalConfirm(null), 3000);
    }
  };

  // Get active data based on tab
  const activeAttempts = activeTab === 'quiz1' ? liveAttempts : liveQuiz2Attempts;
  const activeBanned = activeTab === 'quiz1' ? bannedUsers : bannedQuiz2Users;
  const activeIsLocked = activeTab === 'quiz1' ? isQuizLocked : isQuiz2Locked;
  const activeToggleLock = activeTab === 'quiz1' ? onToggleQuizLock : onToggleQuiz2Lock;

  const activeFiltered = activeAttempts.filter(attempt => 
    attempt.userDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.userDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.userDetails.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSorted = [...activeFiltered].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.startedAt || b.submittedAt).getTime() - new Date(a.startedAt || a.submittedAt).getTime();
    } else if (sortBy === 'score') {
      return b.score - a.score;
    } else {
      return a.timeSpentSeconds - b.timeSpentSeconds;
    }
  });

  const activeStats = {
    total: activeAttempts.length,
    inProgress: activeAttempts.filter(a => a.status === 'in-progress').length,
    completed: activeAttempts.filter(a => a.status === 'completed').length,
    avgScore: activeAttempts.filter(a => a.status === 'completed').length > 0 
      ? (activeAttempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.score, 0) / activeAttempts.filter(a => a.status === 'completed').length).toFixed(1) 
      : 0,
    avgTime: activeAttempts.filter(a => a.status === 'completed').length > 0 
      ? Math.round(activeAttempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.timeSpentSeconds, 0) / activeAttempts.filter(a => a.status === 'completed').length) 
      : 0,
    highScore: activeAttempts.filter(a => a.status === 'completed').length > 0 
      ? Math.max(...activeAttempts.filter(a => a.status === 'completed').map(a => a.score)) 
      : 0,
    flagged: activeAttempts.filter(a => a.isFlagged).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Quiz Management & Analytics</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Quiz Lock Toggle */}
              <button
                onClick={activeToggleLock}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                  activeIsLocked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {activeIsLocked ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  )}
                </svg>
                <span className="hidden sm:inline">{activeIsLocked ? 'Quiz Locked' : 'Quiz Active'}</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Quiz Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('quiz1'); setSearchTerm(''); setDeleteConfirm(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'quiz1'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📊</span>
            Quiz 1 — Business Analytics
            {liveAttempts.length > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'quiz1' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>{liveAttempts.length}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('quiz2'); setSearchTerm(''); setDeleteConfirm(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'quiz2'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📖</span>
            Quiz 2 — Reading Comprehension
            {liveQuiz2Attempts.length > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'quiz2' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>{liveQuiz2Attempts.length}</span>
            )}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm font-medium mb-1">Total Participants</p>
                <p className="text-3xl lg:text-4xl font-bold">{activeStats.total}</p>
                <p className="text-blue-200 text-xs mt-1">In Progress: {activeStats.inProgress}</p>
              </div>
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs lg:text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl lg:text-4xl font-bold">{activeStats.completed}</p>
                <p className="text-green-200 text-xs mt-1">Avg: {activeStats.avgScore}</p>
              </div>
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs lg:text-sm font-medium mb-1">Avg. Time</p>
                <p className="text-2xl lg:text-4xl font-bold">{formatTime(activeStats.avgTime)}</p>
              </div>
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${activeStats.flagged > 0 ? 'from-red-500 to-red-600 animate-pulse' : 'from-orange-500 to-orange-600'} rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${activeStats.flagged > 0 ? 'text-red-100' : 'text-orange-100'} text-xs lg:text-sm font-medium mb-1`}>🚩 Flagged</p>
                <p className="text-3xl lg:text-4xl font-bold">{activeStats.flagged}</p>
                <p className={`${activeStats.flagged > 0 ? 'text-red-200' : 'text-orange-200'} text-xs mt-1`}>Suspicious Activity</p>
              </div>
              <svg className={`w-8 h-8 lg:w-12 lg:h-12 ${activeStats.flagged > 0 ? 'text-red-200' : 'text-orange-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'time')}
                className="w-full lg:w-auto px-6 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white font-medium transition-all"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="time">Sort by Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              Participants ({activeSorted.length})
            </h2>
          </div>

          {activeSorted.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Participants Found</h3>
              <p className="text-gray-600 text-sm lg:text-base">
                {searchTerm ? 'Try adjusting your search criteria' : 'Participants will appear here once they complete the quiz'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {activeSorted.map((attempt, index) => {
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const scoreColor = percentage >= 75 ? 'text-green-600 bg-green-100' : percentage >= 50 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
                  const isInProgress = attempt.status === 'in-progress';
                  
                  return (
                    <div key={attempt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                              {index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900">{attempt.userDetails.fullName}</h3>
                            {isInProgress && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-ping"></span>
                                Live
                              </span>
                            )}
                            {attempt.isFlagged && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                                🚩 {attempt.tabSwitchCount || 0}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{attempt.userDetails.email}</p>
                          <p className="text-sm text-gray-500">{attempt.userDetails.collegeName}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteActive(attempt.id)}
                          className={`p-2 rounded-lg transition-all ${
                            deleteConfirm === attempt.id
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title={deleteConfirm === attempt.id ? 'Click again to confirm' : 'Delete participant'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{isInProgress ? 'Progress' : 'Score'}</p>
                          {isInProgress ? (
                            <p className="text-sm font-semibold text-gray-900">
                              Q {(attempt.currentQuestion || 0) + 1}/{attempt.totalQuestions}
                            </p>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${scoreColor}`}>
                              {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                            </span>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Time {isInProgress ? 'Elapsed' : 'Taken'}</p>
                          <p className="text-sm font-semibold text-gray-900">{formatTime(attempt.timeSpentSeconds)}</p>
                        </div>
                      </div>
                      {attempt.isFlagged && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-red-700 mb-1">🚩 Flag Reasons:</p>
                          <ul className="text-xs text-red-600 space-y-0.5">
                            {(attempt.flagReasons || []).slice(0, 5).map((reason: string, i: number) => (
                              <li key={i}>• {reason}</li>
                            ))}
                            {(attempt.flagReasons || []).length > 5 && (
                              <li className="text-red-400">...and {(attempt.flagReasons || []).length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {isInProgress ? `Started: ${formatDate(attempt.startedAt)}` : `Submitted: ${formatDate(attempt.submittedAt)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Participant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">College</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score/Progress</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">🚩 Flags</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeSorted.map((attempt, index) => {
                      const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                      const scoreColor = percentage >= 75 ? 'text-green-600 bg-green-100' : percentage >= 50 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
                      const isInProgress = attempt.status === 'in-progress';

                      return (
                        <tr key={attempt.id} className={`hover:bg-gray-50 transition-colors ${attempt.isFlagged ? 'bg-red-50/40 border-l-4 border-l-red-500' : isInProgress ? 'bg-yellow-50/30' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900">{attempt.userDetails.fullName}</div>
                              {isInProgress && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-ping"></span>
                                  Live
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{attempt.userDetails.email}</div>
                            {attempt.userDetails.phoneNumber && (
                              <div className="text-sm text-gray-500">{attempt.userDetails.phoneNumber}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {attempt.userDetails.collegeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              isInProgress ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {isInProgress ? 'In Progress' : 'Completed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isInProgress ? (
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">Question {(attempt.currentQuestion || 0) + 1}/{attempt.totalQuestions}</div>
                                <div className="text-gray-500 text-xs">{Object.keys(attempt.answers).length} answered</div>
                              </div>
                            ) : (
                              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${scoreColor}`}>
                                {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(attempt.timeSpentSeconds)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isInProgress ? formatDate(attempt.startedAt) : formatDate(attempt.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {attempt.isFlagged ? (
                              <div className="group relative">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 cursor-help">
                                  🚩 {attempt.tabSwitchCount || 0} switch{(attempt.tabSwitchCount || 0) !== 1 ? 'es' : ''}
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-64">
                                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                    <p className="font-bold mb-1">Flag Reasons:</p>
                                    <ul className="space-y-0.5">
                                      {(attempt.flagReasons || []).map((reason: string, i: number) => (
                                        <li key={i}>• {reason}</li>
                                      ))}
                                    </ul>
                                    <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                ✓ Clean
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteActive(attempt.id)}
                              className={`p-2 rounded-lg transition-all ${
                                deleteConfirm === attempt.id
                                  ? 'bg-red-600 text-white shadow-lg'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title={deleteConfirm === attempt.id ? 'Click again to confirm' : 'Delete participant'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Quiz 2 User Approval Panel – only visible on Quiz 2 tab */}
        {activeTab === 'quiz2' && (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-emerald-200 overflow-hidden mt-6">
            <div className="p-4 lg:p-6 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-emerald-900">User Access Control</h2>
                  <p className="text-sm text-emerald-600">Toggle the switch to approve users for Quiz 2. Only approved users can log in and take the quiz.</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-emerald-100">
              {quiz2Users.map((user) => {
                const isApproved = approvedQuiz2.includes(user.id);
                const isBanned = isQuiz2UserBanned(user.id);
                const isConfirming = approvalConfirm === user.id;

                return (
                  <div key={user.id} className={`p-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isBanned ? 'bg-red-50/50 opacity-60' : isApproved ? 'bg-emerald-50/30' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isBanned ? 'bg-red-100 border-red-300' : isApproved ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                      }`}>
                        {isBanned ? (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : isApproved ? (
                          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">Code: <span className="font-mono text-gray-700">{user.accessCode}</span></p>
                          {isBanned && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Banned</span>}
                          {isApproved && !isBanned && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Approved</span>}
                          {!isApproved && !isBanned && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Not Approved</span>}
                        </div>
                      </div>
                    </div>

                    {isBanned ? (
                      <span className="text-xs text-red-500 font-medium italic">Access revoked</span>
                    ) : (
                      <button
                        onClick={() => handleToggleApproval(user.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                          isConfirming
                            ? (isApproved ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-600 text-white animate-pulse')
                            : isApproved
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700 border border-emerald-300 hover:border-red-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 border border-gray-300 hover:border-emerald-300'
                        }`}
                        title={isConfirming ? 'Click again to confirm' : isApproved ? 'Click to revoke access' : 'Click to approve access'}
                      >
                        {isConfirming ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            {isApproved ? 'Confirm Revoke' : 'Confirm Approve'}
                          </>
                        ) : (
                          <>
                            <div className={`relative w-11 h-6 rounded-full transition-colors ${
                              isApproved ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                                isApproved ? 'translate-x-5' : 'translate-x-0.5'
                              }`}></div>
                            </div>
                            {isApproved ? 'Approved' : 'Approve'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Banned Users Section */}
        {activeBanned.length > 0 && (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-red-200 overflow-hidden mt-6">
            <div className="p-4 lg:p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-red-900">Banned Users ({activeBanned.length})</h2>
                  <p className="text-sm text-red-600">These users have been removed and cannot access the quiz. Click restore to allow them back.</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-red-100">
              {activeBanned.map((user) => (
                <div key={user.id} className="p-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 border-2 border-red-300">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Access Code: <span className="font-mono text-gray-700">{user.accessCode}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(user.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                      restoreConfirm === user.id
                        ? 'bg-green-600 text-white animate-pulse'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    }`}
                    title={restoreConfirm === user.id ? 'Click again to confirm restore' : 'Restore user access'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {restoreConfirm === user.id ? 'Confirm Restore' : 'Restore Access'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
