# Real-Time Quiz Platform - Features Documentation

## Overview
This quiz platform now includes complete real-time synchronization between users taking quizzes and the admin dashboard. All features work entirely client-side using localStorage and browser events.

## ✨ Real-Time Features

### 1. Instant Registration Tracking
- **What happens**: When a user registers and clicks submit, they immediately appear in the admin dashboard
- **How it works**: 
  - Creates a `QuizAttempt` with status `'in-progress'` upon registration
  - Stores in localStorage with key `'quizAttempts'`
  - Admin dashboard polls localStorage every 1 second to detect new registrations
  - Storage events notify other browser tabs instantly

### 2. Live Quiz Progress Monitoring
- **What admin sees**:
  - "Live" badge with pulsing animation for users currently taking the quiz
  - Current question number (e.g., "Question 5/20")
  - Real-time answer updates as users progress
  - Status column showing "In Progress" or "Completed"
  - Yellow highlight for in-progress participants

- **How it works**:
  - QuizInterface updates localStorage every time user selects an answer
  - Current question index is tracked and saved
  - Admin dashboard refreshes from localStorage every 1 second
  - Storage events trigger immediate updates across tabs

### 3. Automatic Quiz Lock Kick-Out
- **What happens**: If admin locks the quiz while a user is taking it, they are immediately kicked out
- **User experience**:
  - Quiz interface instantly disappears
  - Red warning page appears: "Quiz Terminated by Admin"
  - Shows message that progress was saved
  - Can return to home page

- **How it works**:
  - QuizInterface checks `quizLocked` status in localStorage every 1 second
  - When locked status detected, triggers `onKickedOut()` callback
  - App navigates to 'kicked-out' view
  - Storage events ensure instant cross-tab notification

### 4. Automatic User Deletion Kick-Out
- **What happens**: If admin deletes a user who is currently taking the quiz, they are immediately kicked out
- **User experience**: Same as quiz lock kick-out - instant termination with warning page
- **How it works**:
  - QuizInterface checks if their attempt ID still exists in localStorage every 1 second
  - If attempt not found, triggers `onKickedOut()` callback
  - Storage events notify the deleted user's browser tab instantly

### 5. Synchronous Answer Tracking
- **What admin sees**: Every answer selection appears in real-time on the dashboard
- **How it works**:
  - Every time user selects/changes an answer, QuizInterface updates localStorage
  - Dispatches storage event to notify admin dashboard
  - Admin dashboard re-renders with updated answer data
  - Shows current progress (e.g., "Question 8/20")

## 🔧 Technical Implementation

### Storage Architecture
```javascript
// localStorage keys used:
- 'quizAttempts': Array of QuizAttempt objects
- 'quizLocked': Boolean string ('true' or 'false')

// QuizAttempt structure:
{
  id: string,
  userDetails: UserDetails,
  answers: Record<number, string>,
  currentQuestion: number,
  status: 'in-progress' | 'completed',
  score: number,
  timeSpentSeconds: number,
  submittedAt: string,
  startedAt: string
}
```

### Real-Time Sync Mechanisms
1. **Polling Interval**: 1000ms (1 second) refresh rate
2. **Storage Events**: Cross-tab communication when localStorage changes
3. **Manual Dispatch**: `window.dispatchEvent(new Event('storage'))` for same-tab updates

### Component Responsibilities

#### QuizInterface
- ✅ Checks quiz lock status every second
- ✅ Checks if user was deleted every second
- ✅ Updates answers to localStorage on every selection
- ✅ Updates current question number on navigation
- ✅ Dispatches storage events for admin updates

#### AdminDashboard
- ✅ Maintains `liveAttempts` state synced with localStorage
- ✅ Refreshes every 1 second from localStorage
- ✅ Listens to storage events for instant updates
- ✅ Shows live indicators and progress tracking
- ✅ Dispatches events on delete/lock actions

#### App.tsx
- ✅ Creates attempt immediately on registration (status: 'in-progress')
- ✅ Updates attempt to 'completed' on quiz finish
- ✅ Dispatches storage events on delete/lock toggle
- ✅ Handles kicked-out navigation

## 🎮 Admin Controls

### Delete Participant
- **Double-click confirmation**: Click once to mark, click again within 3 seconds to confirm
- **Real-time effect**: If user is taking quiz, they're instantly kicked out
- **Storage event**: Notifies all tabs of the deletion

### Quiz Lock/Unlock Toggle
- **Visual indicator**: Shows lock status with icon
- **Real-time effect**: All active quiz-takers are immediately kicked out when locked
- **Storage event**: Notifies all tabs of the lock status change

## 📱 Responsive Design

### Desktop View (>1024px)
- Full table layout with all columns
- Live badges inline with participant names
- Status and Score/Progress columns visible
- Sortable headers

### Mobile View (<1024px)
- Card-based layout
- Live badges prominently displayed
- Compact information display
- Touch-friendly controls

## 🔐 Admin Credentials
- **Email**: admin@quiz.com
- **Password**: admin123

## ⏱️ Quiz Settings
- **Duration**: 20 minutes (1200 seconds)
- **Questions**: 20 multiple-choice questions
- **Auto-submit**: When timer reaches 0
- **Sync interval**: Every 1 second

## 🚀 How to Test Real-Time Features

1. **Test Registration Tracking**:
   - Open admin dashboard in one browser tab
   - Open quiz in another tab
   - Register and see instant appearance in admin dashboard

2. **Test Live Progress**:
   - Start quiz in one tab
   - Watch admin dashboard in another tab
   - See "Live" badge and question progress update in real-time

3. **Test Quiz Lock Kick-Out**:
   - Start taking quiz in one tab
   - Lock quiz from admin dashboard in another tab
   - See immediate kick-out with warning page

4. **Test Delete Kick-Out**:
   - Start taking quiz
   - Delete your participant from admin dashboard
   - See immediate kick-out with warning page

5. **Test Answer Synchronization**:
   - Answer questions in quiz
   - Watch admin dashboard update with each answer
   - Verify current question number updates live

## 💡 Notes

- All features work entirely client-side (no backend required)
- Uses browser localStorage for data persistence
- Cross-tab communication via storage events
- 1-second polling ensures minimal lag
- TypeScript compile warnings are non-blocking
- All data is stored locally in the browser
