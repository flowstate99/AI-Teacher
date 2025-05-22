import { createContext, useState, useEffect } from 'react';

// Create context
export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load courses from localStorage or set to empty array
  useEffect(() => {
    const stored = localStorage.getItem("generatedCourses");
    if (stored) {
      try {
        const parsedCourses = JSON.parse(stored);
        setCourses(parsedCourses);
      } catch (err) {
        console.error("Failed to parse stored courses:", err);
        localStorage.removeItem("generatedCourses");
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem("generatedCourses", JSON.stringify(courses));
  }, [courses]);

  // Function to add a new generated course
  const addCourse = (course) => {
    setCourses(prev => [...prev, course]);
  };

  // Get next recommended lesson (can customize logic here)
  const getNextRecommendedLesson = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    // Default naive recommendation: first uncompleted lesson
    const progress = JSON.parse(localStorage.getItem("userProgress") || "{}");
    const completed = progress[courseId]?.completedLessons || [];

    return course.lessons.find(lesson =>
      !completed.includes(lesson.id) &&
      lesson.requiresCompletion.every(reqId => completed.includes(reqId))
    );
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        addCourse,
        getNextRecommendedLesson
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
