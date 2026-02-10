// Pre-registered quiz participants with unique 8-digit access codes
// Only these users can take the quiz. If deleted by admin, they are permanently banned.

export interface RegisteredUser {
  id: string;
  name: string;
  accessCode: string;
}

export const registeredUsers: RegisteredUser[] = [
  { id: 'user-01', name: 'RISHNI X',            accessCode: '7A3F92B1' },
  { id: 'user-02', name: 'RANJITH M',           accessCode: 'D4E81C6F' },
  { id: 'user-03', name: 'VARSHA SUGUMAR',      accessCode: 'B9F2A50E' },
  { id: 'user-04', name: 'DURGA JAI',           accessCode: '3C7D6E8A' },
  { id: 'user-05', name: 'RASHA R J',           accessCode: 'E5B14D72' },
  { id: 'user-06', name: 'GOUTHAM K SURESH',    accessCode: '8F06C3A9' },
  { id: 'user-07', name: 'JESWIN MANJILA',      accessCode: '2D9E7B54' },
  { id: 'user-08', name: 'NAVANEETH OB',        accessCode: 'A1C83F6D' },
  { id: 'user-09', name: 'MAHIMA SHREE K',      accessCode: '6E4B29C7' },
  { id: 'user-10', name: 'HARRIET MINERVA K',   accessCode: 'F7D5A018' },
  { id: 'user-11', name: 'HARINI M R',          accessCode: '4B8C1E93' },
  { id: 'user-12', name: 'HARINI S',            accessCode: 'C2A67F45' },
  { id: 'user-13', name: 'PRANAV BALAJEE L',    accessCode: '91E3D8B6' },
  { id: 'user-14', name: 'SANJAY S',            accessCode: '5F7A4C20' },
  { id: 'user-15', name: 'JUHARIYA',            accessCode: '0D6B9E3F' },
  { id: 'user-16', name: 'HARSHINI S',          accessCode: 'E8C25A71' },
  { id: 'user-17', name: 'DUMMY 1',             accessCode: '1A2B3C4D' },
  { id: 'user-18', name: 'DUMMY 2',             accessCode: '5E6F7A8B' },
  { id: 'user-19', name: 'DUMMY 3',             accessCode: '9C0D1E2F' },
  { id: 'user-20', name: 'DUMMY 4',             accessCode: '3A4B5C6D' },
  { id: 'user-21', name: 'DUMMY 5',             accessCode: '7E8F9A0B' },
];

// Check if a user is banned (deleted by admin)
export function isUserBanned(userId: string): boolean {
  const banned: string[] = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
  return banned.includes(userId);
}

// Ban a user permanently
export function banUser(userId: string): void {
  const banned: string[] = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
  if (!banned.includes(userId)) {
    banned.push(userId);
    localStorage.setItem('bannedUsers', JSON.stringify(banned));
  }
}

// Unban a user so they can participate again
export function unbanUser(userId: string): void {
  const banned: string[] = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
  const updated = banned.filter(id => id !== userId);
  localStorage.setItem('bannedUsers', JSON.stringify(updated));
}

// Get all banned users with their details
export function getBannedUsers(): RegisteredUser[] {
  const banned: string[] = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
  return registeredUsers.filter(u => banned.includes(u.id));
}

// Check if user has already completed the quiz
export function hasUserCompletedQuiz(userId: string): boolean {
  const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
  return attempts.some((a: any) => a.registeredUserId === userId && a.status === 'completed');
}

// Authenticate user by access code
export function authenticateUser(accessCode: string): RegisteredUser | null {
  const code = accessCode.trim().toUpperCase();
  const user = registeredUsers.find(u => u.accessCode === code);
  if (!user) return null;
  if (isUserBanned(user.id)) return null;
  return user;
}
