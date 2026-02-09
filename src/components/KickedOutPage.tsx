interface KickedOutPageProps {
  onReturnHome: () => void;
}

export default function KickedOutPage({ onReturnHome }: KickedOutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Warning Icon */}
          <div className="bg-gradient-to-br from-red-600 to-orange-600 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>
            <div className="relative z-10">
              <div className="inline-block p-6 bg-white rounded-full mb-6 shadow-xl animate-bounce">
                <svg className="w-20 h-20 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Quiz Session Ended</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Your Quiz Has Been Terminated</h2>
              <p className="text-gray-200 text-lg mb-2">
                Your quiz session has been ended by the administrator.
              </p>
              <p className="text-gray-300">
                This may have occurred because the quiz was locked, your entry was removed, or there was an administrative action.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-orange-500/20 border-2 border-orange-400/40 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-orange-200 mb-1">Your Progress</h4>
                  <p className="text-orange-100 text-sm">
                    Any answers you submitted have been saved. Please contact the administrator for more information about accessing your results.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onReturnHome}
              className="w-full bg-gradient-to-r from-white to-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Return to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-300">
          <p>If you have questions, please contact the quiz administrator.</p>
        </div>
      </div>
    </div>
  );
}
