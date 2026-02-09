export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface UserDetails {
  fullName: string;
  collegeName: string;
  email: string;
  phoneNumber?: string;
}

export interface QuizAttempt {
  id: string;
  userDetails: UserDetails;
  answers: Record<number, string>;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: string;
  status: 'in-progress' | 'completed';
  currentQuestion?: number;
  startedAt: string;
  tabSwitchCount: number;
  isFlagged: boolean;
  flagReasons: string[];
}

export interface AdminCredentials {
  email: string;
  password: string;
}
