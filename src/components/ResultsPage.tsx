import { UserDetails } from '../types';

interface ResultsPageProps {
  userDetails: UserDetails;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  onReturnHome: () => void;
}

export default function ResultsPage({ userDetails, score, totalQuestions, timeSpent, onReturnHome }: ResultsPageProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Outstanding! 🎉', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 75) return { text: 'Great Job! 👏', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { text: 'Good Effort! 👍', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Keep Learning! 📚', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 text-lg">Here are your results</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">{userDetails.fullName}</h2>
            <p className="text-indigo-100">{userDetails.email}</p>
            <p className="text-indigo-100">{userDetails.collegeName}</p>
          </div>

          {/* Score Display */}
          <div className="p-8">
            <div className={`${performance.bg} rounded-2xl p-8 mb-6 text-center border-2 border-dashed ${performance.color.replace('text-', 'border-')}`}>
              <h3 className={`text-3xl font-bold ${performance.color} mb-2`}>{performance.text}</h3>
              <div className="text-6xl font-bold text-gray-900 my-4">{percentage}%</div>
              <p className="text-xl text-gray-700">
                {score} out of {totalQuestions} correct
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="text-blue-600 font-semibold text-sm mb-2">TOTAL QUESTIONS</div>
                <div className="text-3xl font-bold text-blue-900">{totalQuestions}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="text-green-600 font-semibold text-sm mb-2">CORRECT ANSWERS</div>
                <div className="text-3xl font-bold text-green-900">{score}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-purple-600 font-semibold text-sm mb-2">TIME TAKEN</div>
                <div className="text-3xl font-bold text-purple-900">{formatTime(timeSpent)}</div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Performance Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Accuracy Rate</span>
                  <span className="font-semibold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Wrong Answers: {totalQuestions - score}</span>
                  <span>Unanswered: {totalQuestions - score - (totalQuestions - Object.keys({}).length)}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onReturnHome}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Return to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your results have been saved successfully.</p>
        </div>
      </div>
    </div>
  );
}
