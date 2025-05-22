import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { CourseContext } from '../contexts/CourseContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProgress } = useContext(UserContext);
  const { courses, loading } = useContext(CourseContext);
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  
  useEffect(() => {
    if (!loading && courses.length > 0) {
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse);
      
      if (foundCourse) {
        const foundLesson = foundCourse.lessons.find(l => l.id === lessonId);
        setLesson(foundLesson);
        
        // Check if user can access this lesson
        if (foundLesson && user) {
          const userProgress = user.progress?.[courseId] || { completedLessons: [] };
          const isAvailable = foundLesson.requiresCompletion.every(reqId => 
            userProgress.completedLessons.includes(reqId)
          );
          
          if (!isAvailable) {
            // Redirect to course page if prerequisites not met
            navigate(`/course/${courseId}`);
          }
        }
      }
    }
  }, [courseId, lessonId, courses, loading, user, navigate]);
  
  if (loading || !lesson || !course) {
    return <LoadingSpinner />;
  }

  const handleCompleteLesson = () => {
    updateUserProgress(courseId, lessonId);
    
    // Find next lesson
    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
    
    if (currentIndex < sortedLessons.length - 1) {
      // Navigate to next lesson
      navigate(`/course/${courseId}/lesson/${sortedLessons[currentIndex + 1].id}`);
    } else {
      // If this was the last lesson, go to the quiz or back to course
      const quiz = course.quizzes[0];
      if (quiz) {
        navigate(`/course/${courseId}/quiz/${quiz.id}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    }
  };
  
  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <h1>{lesson.title}</h1>
        <div className="lesson-nav">
          <button onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
      
      <div className="lesson-content">
        <MarkdownRenderer content={lesson.content} />
      </div>
      
      <div className="lesson-actions">
        <button 
          className="complete-btn"
          onClick={handleCompleteLesson}
        >
          Mark as Complete
        </button>
      </div>
    </div>
  );
};

export default LessonPage;