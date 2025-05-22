import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { CourseContext } from '../contexts/CourseContext';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { updateUserProgress } = useContext(UserContext);
  const { courses, loading } = useContext(CourseContext);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    if (!loading && courses.length > 0) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const foundQuiz = course.quizzes.find(q => q.id === quizId);
        setQuiz(foundQuiz);
        setAnswers({});
        setShowResults(false);
      }
    }
  }, [courseId, quizId, courses, loading]);
  
  if (loading || !quiz) {
    return <LoadingSpinner />;
  }

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = (correctAnswers / quiz.questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);
    
    // Update user progress with quiz score
    updateUserProgress(courseId, quizId, finalScore);
  };

  const currentQ = quiz.questions[currentQuestion];
  
  if (showResults) {
    return (
      <div className="quiz-results">
        <h1>Quiz Results</h1>
        <div className="score-display">
          <h2>Your Score: {score.toFixed(0)}%</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${score}%` }}></div>
          </div>
        </div>
        
        <div className="results-feedback">
          {score >= 70 ? (
            <div className="success-message">
              <h3>Great job!</h3>
              <p>You've demonstrated a good understanding of the material.</p>
            </div>
          ) : (
            <div className="review-message">
              <h3>Review Recommended</h3>
              <p>We recommend reviewing the course material before proceeding.</p>
            </div>
          )}
        </div>
        
        <button 
          className="return-btn"
          onClick={() => navigate(`/course/${courseId}`)}
        >
          Return to Course
        </button>
        
        {/* Show additional recommendations based on performance */}
        {score < 70 && (
          <div className="recommendations">
            <h3>Recommended Review Sections:</h3>
            <ul>
              {quiz.questions
                .filter((_, index) => answers[index] !== quiz.questions[index].correctAnswer)
                .map((q, i) => (
                  <li key={i}>{q.question}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="quiz-page">
      <h1>{quiz.title}</h1>
      
      <div className="quiz-progress">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </div>
      
      <div className="question-container">
        <h2>{currentQ.question}</h2>
        
        <div className="options-list">
          {currentQ.options.map((option, index) => (
            <div 
              key={index} 
              className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswer(currentQuestion, index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      
      <div className="quiz-actions">
        <button 
          className="next-btn"
          disabled={answers[currentQuestion] === undefined}
          onClick={handleNextQuestion}
        >
          {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizPage;