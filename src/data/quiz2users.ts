// Special users for Quiz 2 - Reading Comprehension
// Only these 5 users can access Quiz 2

export interface Quiz2User {
  id: string;
  name: string;
  accessCode: string;
}

export const quiz2Users: Quiz2User[] = [
  { id: 'q2-user-01', name: 'ARAVIND KUMAR',      accessCode: '5B2E8F1A' },
  { id: 'q2-user-02', name: 'DEEPIKA RAJ',        accessCode: 'C9A34D7E' },
  { id: 'q2-user-03', name: 'KARTHIK SUBRAM',     accessCode: '1F6B83C2' },
  { id: 'q2-user-04', name: 'MEERA LAKSHMI',      accessCode: 'A7D52E9F' },
  { id: 'q2-user-05', name: 'VISHAL PRAKASH',     accessCode: '3E8C16D4' },
];

// Check if a quiz2 user is banned
export function isQuiz2UserBanned(userId: string): boolean {
  const banned: string[] = JSON.parse(localStorage.getItem('quiz2BannedUsers') || '[]');
  return banned.includes(userId);
}

// Ban a quiz2 user permanently
export function banQuiz2User(userId: string): void {
  const banned: string[] = JSON.parse(localStorage.getItem('quiz2BannedUsers') || '[]');
  if (!banned.includes(userId)) {
    banned.push(userId);
    localStorage.setItem('quiz2BannedUsers', JSON.stringify(banned));
  }
}

// Unban a quiz2 user
export function unbanQuiz2User(userId: string): void {
  const banned: string[] = JSON.parse(localStorage.getItem('quiz2BannedUsers') || '[]');
  const updated = banned.filter(id => id !== userId);
  localStorage.setItem('quiz2BannedUsers', JSON.stringify(updated));
}

// Get all banned quiz2 users with their details
export function getBannedQuiz2Users(): Quiz2User[] {
  const banned: string[] = JSON.parse(localStorage.getItem('quiz2BannedUsers') || '[]');
  return quiz2Users.filter(u => banned.includes(u.id));
}

// Check if quiz2 user has already completed the quiz
export function hasQuiz2UserCompleted(userId: string): boolean {
  const attempts = JSON.parse(localStorage.getItem('quiz2Attempts') || '[]');
  return attempts.some((a: any) => a.registeredUserId === userId && a.status === 'completed');
}

// Authenticate quiz2 user by access code
export function authenticateQuiz2User(accessCode: string): Quiz2User | null {
  const code = accessCode.trim().toUpperCase();
  const user = quiz2Users.find(u => u.accessCode === code);
  if (!user) return null;
  if (isQuiz2UserBanned(user.id)) return null;
  return user;
}

// ── Quiz 2 Approval System ──
// Only admin-approved users can access Quiz 2

export function getApprovedQuiz2UserIds(): string[] {
  return JSON.parse(localStorage.getItem('quiz2ApprovedUsers') || '[]');
}

export function isQuiz2UserApproved(userId: string): boolean {
  const approved = getApprovedQuiz2UserIds();
  return approved.includes(userId);
}

export function approveQuiz2User(userId: string): void {
  const approved = getApprovedQuiz2UserIds();
  if (!approved.includes(userId)) {
    approved.push(userId);
    localStorage.setItem('quiz2ApprovedUsers', JSON.stringify(approved));
  }
}

export function revokeQuiz2UserApproval(userId: string): void {
  const approved = getApprovedQuiz2UserIds();
  const updated = approved.filter(id => id !== userId);
  localStorage.setItem('quiz2ApprovedUsers', JSON.stringify(updated));
}

export function toggleQuiz2UserApproval(userId: string): boolean {
  if (isQuiz2UserApproved(userId)) {
    revokeQuiz2UserApproval(userId);
    return false;
  } else {
    approveQuiz2User(userId);
    return true;
  }
}
