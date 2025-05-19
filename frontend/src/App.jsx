import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import LessonView from './components/LessonView';
import AssessmentView from './components/AssessmentView';
import Navigation from './components/Navigation';
// import { AuthProvider } from './contexts/AuthContext';
import { LearningProvider } from './contexts/LearningContext';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registered: ', registration);
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }

    // Handle online/offline status
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <AuthProvider>
      <LearningProvider>
        <Router>
          <div className="app-container">
            {!isOnline && <div className="offline-banner">You are currently offline. Some features may be limited.</div>}
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/course/:courseId" element={<CourseView />} />
                <Route path="/lesson/:lessonId" element={<LessonView />} />
                <Route path="/assessment/:assessmentId" element={<AssessmentView />} />
              </Routes>
            </main>
          </div>
        </Router>
      </LearningProvider>
    </AuthProvider>
  );
}

export default App;
