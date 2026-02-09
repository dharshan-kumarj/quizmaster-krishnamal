import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import QuizPage from './pages/QuizPage';
import Quiz2Page from './pages/Quiz2Page';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quiz1" element={<QuizPage />} />
        <Route path="/quiz2" element={<Quiz2Page />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Navigate to="/quiz1" replace />} />
        <Route path="*" element={<Navigate to="/quiz1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
