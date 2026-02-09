interface QuizLockedPageProps {
  onReturnHome: () => void;
}

export default function QuizLockedPage({ onReturnHome }: QuizLockedPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Lock Icon */}
          <div className="bg-gradient-to-br from-red-500 to-orange-600 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse delay-500"></div>
            </div>
            <div className="relative z-10">
              <div className="inline-block p-6 bg-white rounded-full mb-6 shadow-xl">
                <svg className="w-20 h-20 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Quiz Locked</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Access Temporarily Restricted</h2>
              <p className="text-gray-300 text-lg mb-2">
                The quiz is currently unavailable and has been locked by the administrator.
              </p>
              <p className="text-gray-400">
                This may be due to scheduled maintenance, review period, or other administrative reasons.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-yellow-300 mb-1">What to Do?</h4>
                  <p className="text-yellow-200 text-sm">
                    Please check back later or contact the administrator for more information about when the quiz will be available again.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onReturnHome}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Return to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>If you believe this is an error, please contact the administrator.</p>
        </div>
      </div>
    </div>
  );
}
