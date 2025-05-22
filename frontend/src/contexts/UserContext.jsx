import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      try {
        // In a real app, this would be an API call
        const userData = localStorage.getItem('user');
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUserProgress = (courseId, lessonId, score) => {
    if (!user) return;

    const updatedUser = { ...user };
    
    if (!updatedUser.progress) {
      updatedUser.progress = {};
    }
    
    if (!updatedUser.progress[courseId]) {
      updatedUser.progress[courseId] = {
        completedLessons: [],
        quizScores: {},
        overallProgress: 0,
      };
    }

    // Update completed lessons
    if (lessonId && !updatedUser.progress[courseId].completedLessons.includes(lessonId)) {
      updatedUser.progress[courseId].completedLessons.push(lessonId);
    }

    // Update quiz scores if provided
    if (score !== undefined) {
      updatedUser.progress[courseId].quizScores[lessonId] = score;
    }

    // Save to state and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, updateUserProgress }}>
      {children}
    </UserContext.Provider>
  );
}