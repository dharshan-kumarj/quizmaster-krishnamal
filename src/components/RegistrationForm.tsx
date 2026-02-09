import { useState } from 'react';

interface RegistrationFormProps {
  onSubmit: (accessCode: string) => void;
  errorMessage?: string;
}

export default function RegistrationForm({ onSubmit, errorMessage }: RegistrationFormProps) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter your access code');
      return;
    }
    if (code.length !== 8) {
      setError('Access code must be 8 characters');
      return;
    }
    setError('');
    onSubmit(code);
  };

  const displayError = errorMessage || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Analytics Quiz</h1>
          <p className="text-gray-600 text-lg">Enter your unique access code to begin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Participant Login
            </h2>
            <p className="text-indigo-100 mt-1">Only pre-registered participants can access this quiz</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {displayError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-red-800">Access Denied</p>
                  <p className="text-sm text-red-600 mt-0.5">{displayError}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="accessCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Access Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase());
                  setError('');
                }}
                maxLength={8}
                className={`w-full px-5 py-4 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-mono tracking-[0.3em] uppercase ${
                  displayError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                }`}
                placeholder="XXXXXXXX"
                autoComplete="off"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">Enter the 8-character code provided to you</p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Authenticate & Start Quiz
              </span>
            </button>
          </form>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-800 font-medium">🔒 This quiz is restricted to authorized participants only.</p>
          <p className="text-xs text-amber-600 mt-1">Contact the quiz administrator if you haven't received your access code.</p>
        </div>
      </div>
    </div>
  );
}
