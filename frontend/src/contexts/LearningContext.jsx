import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const LearningContext = createContext();

export const LearningProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [currentProgress, setCurrentProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        setLoading(true);
        const profile = await api.getProfile(userId);
        const progress = await api.getLearningProgress(userId);
        const path = await api.getLearningPath(userId);
        
        setUserProfile(profile);
        setCurrentProgress(progress);
        setLearningPath(path);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateProgress = async (lessonId, assessmentResults) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      await api.updateLessonProgress(userId, lessonId, assessmentResults);
      
      // Refresh learning path based on new assessment results
      const newPath = await api.getLearningPath(userId);
      setLearningPath(newPath);
      
      // Update current progress
      const progress = await api.getLearningProgress(userId);
      setCurrentProgress(progress);
      
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  };

  return (
    <LearningContext.Provider value={{
      userProfile,
      learningPath,
      currentProgress,
      loading,
      updateProgress
    }}>
      {children}
    </LearningContext.Provider>
  );
};