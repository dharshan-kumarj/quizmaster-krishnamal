import { useState, useEffect } from 'react';
import { QuizAttempt } from '../types';

interface AdminDashboardProps {
  attempts: QuizAttempt[];
  onLogout: () => void;
  onDeleteAttempt: (id: string) => void;
  isQuizLocked: boolean;
  onToggleQuizLock: () => void;
}

export default function AdminDashboard({ attempts, onLogout, onDeleteAttempt, isQuizLocked, onToggleQuizLock }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'time'>('date');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [liveAttempts, setLiveAttempts] = useState(attempts);

  // Auto-refresh from localStorage every second for live updates
  useEffect(() => {
    setLiveAttempts(attempts);
  }, [attempts]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const savedAttempts = localStorage.getItem('quizAttempts');
      if (savedAttempts) {
        setLiveAttempts(JSON.parse(savedAttempts));
      }
    }, 1000);

    // Listen for storage events from other tabs
    const handleStorageChange = () => {
      const savedAttempts = localStorage.getItem('quizAttempts');
      if (savedAttempts) {
        setLiveAttempts(JSON.parse(savedAttempts));
      }
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

  const filteredAttempts = liveAttempts.filter(attempt => 
    attempt.userDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.userDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.userDetails.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.startedAt || b.submittedAt).getTime() - new Date(a.startedAt || a.submittedAt).getTime();
    } else if (sortBy === 'score') {
      return b.score - a.score;
    } else {
      return a.timeSpentSeconds - b.timeSpentSeconds;
    }
  });

  const stats = {
    total: liveAttempts.length,
    inProgress: liveAttempts.filter(a => a.status === 'in-progress').length,
    completed: liveAttempts.filter(a => a.status === 'completed').length,
    avgScore: liveAttempts.filter(a => a.status === 'completed').length > 0 
      ? (liveAttempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.score, 0) / liveAttempts.filter(a => a.status === 'completed').length).toFixed(1) 
      : 0,
    avgTime: liveAttempts.filter(a => a.status === 'completed').length > 0 
      ? Math.round(liveAttempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.timeSpentSeconds, 0) / liveAttempts.filter(a => a.status === 'completed').length) 
      : 0,
    highScore: liveAttempts.filter(a => a.status === 'completed').length > 0 
      ? Math.max(...liveAttempts.filter(a => a.status === 'completed').map(a => a.score)) 
      : 0,
    flagged: liveAttempts.filter(a => a.isFlagged).length
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteAttempt(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
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
                onClick={onToggleQuizLock}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                  isQuizLocked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isQuizLocked ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  )}
                </svg>
                <span className="hidden sm:inline">{isQuizLocked ? 'Quiz Locked' : 'Quiz Active'}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm font-medium mb-1">Total Participants</p>
                <p className="text-3xl lg:text-4xl font-bold">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-1">In Progress: {stats.inProgress}</p>
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
                <p className="text-3xl lg:text-4xl font-bold">{stats.completed}</p>
                <p className="text-green-200 text-xs mt-1">Avg: {stats.avgScore}</p>
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
                <p className="text-2xl lg:text-4xl font-bold">{formatTime(stats.avgTime)}</p>
              </div>
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${stats.flagged > 0 ? 'from-red-500 to-red-600 animate-pulse' : 'from-orange-500 to-orange-600'} rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stats.flagged > 0 ? 'text-red-100' : 'text-orange-100'} text-xs lg:text-sm font-medium mb-1`}>🚩 Flagged</p>
                <p className="text-3xl lg:text-4xl font-bold">{stats.flagged}</p>
                <p className={`${stats.flagged > 0 ? 'text-red-200' : 'text-orange-200'} text-xs mt-1`}>Suspicious Activity</p>
              </div>
              <svg className={`w-8 h-8 lg:w-12 lg:h-12 ${stats.flagged > 0 ? 'text-red-200' : 'text-orange-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              Participants ({sortedAttempts.length})
            </h2>
          </div>

          {sortedAttempts.length === 0 ? (
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
                {sortedAttempts.map((attempt, index) => {
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
                          onClick={() => handleDelete(attempt.id)}
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
                    {sortedAttempts.map((attempt, index) => {
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
                              onClick={() => handleDelete(attempt.id)}
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
      </div>
    </div>
  );
}
