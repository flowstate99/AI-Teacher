import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import { UserProvider } from './contexts/UserContext';
import { CourseProvider } from './contexts/CourseContext';
import './App.css';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if the app is online or offline
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <UserProvider>
      <CourseProvider>
        <Router>
          <div className="app-container">
            {!isOnline && (
              <div className="offline-banner">
                You are currently offline. Some features may be limited.
              </div>
            )}
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/course/:courseId" element={
                  <ErrorBoundary>
                    <CoursePage />
                  </ErrorBoundary>
                } />
                <Route path="/course/:courseId/lesson/:lessonId" element={
                  <ErrorBoundary>
                    <LessonPage />
                  </ErrorBoundary>
                } />
                <Route path="/course/:courseId/quiz/:quizId" element={
                  <ErrorBoundary>
                    <QuizPage />
                  </ErrorBoundary>
                } />
                <Route path="/profile" element={
                  <ErrorBoundary>
                    <ProfilePage />
                  </ErrorBoundary>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </CourseProvider>
    </UserProvider>
  );
}

export default App;