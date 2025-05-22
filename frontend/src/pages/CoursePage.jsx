import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { CourseContext } from '../contexts/CourseContext';
import LessonCard from '../components/LessonCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursePage = () => {
  const { courseId } = useParams();
  const { user } = useContext(UserContext);
  const { courses, getNextRecommendedLesson, loading } = useContext(CourseContext);
  const [course, setCourse] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  
  useEffect(() => {
    if (!loading && courses.length > 0) {
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse);
      
      if (foundCourse) {
        const nextRec = getNextRecommendedLesson(courseId);
        setNextLesson(nextRec);
      }
    }
  }, [courseId, courses, loading, getNextRecommendedLesson]);
  
  if (loading || !course) {
    return <LoadingSpinner />;
  }

  const userProgress = user?.progress?.[courseId] || { completedLessons: [] };
  
  // Calculate overall progress
  const completionPercentage = course.lessons.length > 0 
    ? (userProgress.completedLessons.length / course.lessons.length) * 100 
    : 0;
  
  return (
    <div className="course-page">
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span>{completionPercentage.toFixed(0)}% Complete</span>
      </div>
      
      {nextLesson && (
        <div className="next-lesson-container">
          <h2>Continue Learning</h2>
          <Link to={`/course/${courseId}/lesson/${nextLesson.id}`} className="continue-btn">
            {nextLesson.title} →
          </Link>
        </div>
      )}
      
      <h2>Course Content</h2>
      <div className="lessons-list">
        {course.lessons.sort((a, b) => a.order - b.order).map(lesson => {
          const isCompleted = userProgress.completedLessons.includes(lesson.id);
          const isAvailable = lesson.requiresCompletion.every(reqId => 
            userProgress.completedLessons.includes(reqId)
          );
          
          return (
            <LessonCard 
              key={lesson.id}
              lesson={lesson}
              isCompleted={isCompleted}
              isAvailable={isAvailable}
              courseId={courseId}
            />
          );
        })}
      </div>
      
      <h2>Assessments</h2>
      <div className="quiz-list">
        {course.quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <h3>{quiz.title}</h3>
            <Link to={`/course/${courseId}/quiz/${quiz.id}`} className="quiz-btn">
              Take Quiz
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;