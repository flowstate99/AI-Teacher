import { Link } from 'react-router-dom';

const LessonCard = ({ lesson, isCompleted, isAvailable, courseId }) => {
  return (
    <div 
      className={`lesson-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}`}
    >
      <div className="lesson-status">
        {isCompleted ? '✓' : isAvailable ? '○' : '🔒'}
      </div>
      
      <div className="lesson-info">
        <h3>{lesson.title}</h3>
      </div>
      
      {isAvailable ? (
        <Link to={`/course/${courseId}/lesson/${lesson.id}`} className="lesson-link">
          {isCompleted ? 'Review' : 'Start'}
        </Link>
      ) : (
        <div className="prerequisite-message">
          Complete previous lessons first
        </div>
      )}
    </div>
  );
};

export default LessonCard;