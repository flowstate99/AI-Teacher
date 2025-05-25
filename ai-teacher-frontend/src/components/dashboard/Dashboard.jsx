// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import HomeView from './views/HomeView';
import CoursesView from './views/CoursesView';
import AssessmentsView from './views/AssessmentsView';
import ProgressView from './views/ProgressView';
import ProfileView from './views/ProfileView';
import ApiDebugger from '../debug/ApiDebugger';
import { useToast } from '../ui/ErrorToast';
import apiService from '../../services/api';

const Dashboard = ({ user, token, onLogout }) => {
  const [currentView, setCurrentView] = useState('home');
  const [userData, setUserData] = useState({
    courses: [],
    assessments: [],
    userStats: {},
    assessmentStats: {},
    courseStats: {},
  });
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { showError, showSuccess, ToastContainer } = useToast();

  useEffect(() => {
    loadUserData();
  }, [token]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [
        coursesData,
        userStatsData,
        assessmentStatsData,
        courseStatsData,
        assessmentsData
      ] = await Promise.all([
        apiService.getUserCourses(token).catch((error) => {
          console.warn('Failed to load courses:', error.message);
          return [];
        }),
        apiService.getUserStats(token).catch((error) => {
          console.warn('Failed to load user stats:', error.message);
          return {};
        }),
        apiService.getAssessmentStats(token).catch((error) => {
          console.warn('Failed to load assessment stats:', error.message);
          return {};
        }),
        apiService.getCourseStats(token).catch((error) => {
          console.warn('Failed to load course stats:', error.message);
          return {};
        }),
        apiService.getAssessments(token).catch((error) => {
          console.warn('Failed to load assessments:', error.message);
          return [];
        })
      ]);

      setUserData({
        courses: coursesData || [],
        assessments: assessmentsData || [],
        userStats: userStatsData || {},
        assessmentStats: assessmentStatsData || {},
        courseStats: courseStatsData || {},
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      showError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadUserData();
  };

  const renderCurrentView = () => {
    const viewProps = {
      user,
      token,
      userData,
      loading,
      refreshData,
      setCurrentView,
      showError,
      showSuccess,
    };

    switch (currentView) {
      case 'home':
        return <HomeView {...viewProps} />;
      case 'courses':
        return <CoursesView {...viewProps} />;
      case 'assessments':
        return <AssessmentsView {...viewProps} />;
      case 'progress':
        return <ProgressView {...viewProps} />;
      case 'profile':
        return <ProfileView {...viewProps} />;
      default:
        return <HomeView {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={onLogout}
      />
      
      <main className="pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentView()}
        </div>
      </main>
      
      <ToastContainer />
      
      {/* Temporary debugger - remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ApiDebugger token={token} />
      )} */}
    </div>
  );
};

export default Dashboard;