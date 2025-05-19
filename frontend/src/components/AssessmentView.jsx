import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LearningContext } from '../contexts/LearningContext';
import api from '../services/api';

const AssessmentView = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { updateProgress } = useContext(LearningContext);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adaptiveFollowup, setAdaptiveFollowup] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await api.getAssessment(assessmentId);
        setAssessment(data);
        
        // Initialize empty answers
        const initialAnswers = {};
        data.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const handleAnswer = (questionIndex, answerValue) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerValue
    });
    
    // Check if this is a diagnostic assessment that requires adaptive follow-up
    if (assessment.isAdaptive) {
      checkForAdaptiveFollowup(questionIndex, answerValue);
    }
  };

  const checkForAdaptiveFollowup = async (questionIndex, answerValue) => {
    // If incorrect, check if we need to add a follow-up diagnostic question
    if (!assessment.questions[questionIndex].correctAnswer.includes(answerValue)) {
      try {
        const followup = await api.getAdaptiveFollowupQuestion(
          assessment.id, 
          questionIndex, 
          answerValue
        );
        
        if (followup) {
          setAdaptiveFollowup(followup);
        }
      } catch (error) {
        console.error('Error getting adaptive follow-up:', error);
      }
    }
  };

  const nextQuestion = () => {
    // If there's an adaptive follow-up question, show it first
    if (adaptiveFollowup) {
      setAdaptiveFollowup(null);
      return;
    }
    
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      setSubmitting(true);
      
      // Calculate results
      const results = {
        assessmentId,
        answers,
        score: 0,
        conceptsToReview: [],
        strengthAreas: []
      };
      
      // Analyze answers and identify concepts to review
      assessment.questions.forEach((question, index) => {
        const isCorrect = question.correctAnswer.includes(answers[index]);
        if (isCorrect) {
          results.score += 1;
          if (question.concept) {
            results.strengthAreas.push(question.concept);
          }
        } else if (question.concept) {
          results.conceptsToReview.push(question.concept);
        }
      });
      
      // Convert to percentage
      results.score = (results.score / assessment.questions.length) * 100;
      
      // Update progress and get new learning path
      await updateProgress(assessment.lessonId, results);
      
      // Navigate to results page
      navigate(`/lesson/${assessment.lessonId}/results`, { state: { results } });
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading assessment...</div>;
  }

  // If showing an adaptive follow-up question
  if (adaptiveFollowup) {
    return (
      <div className="assessment adaptive-followup">
        <h2>Let's dig deeper</h2>
        <div className="question">
          <h3>{adaptiveFollowup.question}</h3>
          <div className="options">
            {adaptiveFollowup.options.map((option, index) => (
              <button 
                key={index}
                className="option-btn"
                onClick={() => {
                  // Record this diagnostic response
                  api.recordAdaptiveResponse(assessment.id, adaptiveFollowup.id, option);
                  setAdaptiveFollowup(null);
                  nextQuestion();
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQuestion];

  return (
    <div className="assessment-container">
      <h1>{assessment.title}</h1>
      <div className="progress-indicator">
        Question {currentQuestion + 1} of {assessment.questions.length}
      </div>
      
      <div className="question-container">
        <h2>{currentQ.question}</h2>
        
        <div className="options-container">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
              onClick={() => handleAnswer(currentQuestion, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="assessment-controls">
        <button 
          className="prev-btn"
          disabled={currentQuestion === 0}
          onClick={previousQuestion}
        >
          Previous
        </button>
        
        {currentQuestion < assessment.questions.length - 1 ? (
          <button 
            className="next-btn"
            disabled={answers[currentQuestion] === null}
            onClick={nextQuestion}
          >
            Next
          </button>
        ) : (
          <button 
            className="submit-btn"
            disabled={submitting || Object.values(answers).some(a => a === null)}
            onClick={submitAssessment}
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentView;