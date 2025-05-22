import { Link } from 'react-router-dom';

const CourseCard = ({ course, progress }) => {
  const completionRate = progress && course.lessons.length > 0 
    ? (progress.completedLessons.length / course.lessons.length) * 100 
    : 0;
    
  const isStarted = progress && progress.completedLessons.length > 0;
  const isCompleted = completionRate === 100;
  
  return (
    <div className={`course-card ${isStarted ? 'started' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="course-level">{course.level}</div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      
      {isStarted && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <span>{completionRate.toFixed(0)}% Complete</span>
        </div>
      )}
      
      {course.recommendation && (
        <div className={`recommendation ${course.recommendation.recommended ? 'positive' : 'negative'}`}>
          {course.recommendation.reason}
        </div>
      )}
      
      <Link to={`/course/${course.id}`} className="course-link">
        {isStarted ? 'Continue' : 'Start Learning'}
      </Link>
    </div>
  );
};

export default CourseCard;