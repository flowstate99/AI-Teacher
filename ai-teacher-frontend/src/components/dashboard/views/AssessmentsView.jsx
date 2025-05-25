// src/components/dashboard/views/AssessmentsView.jsx
import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Award,
  BarChart3,
  Brain,
  Play,
  RotateCcw
} from 'lucide-react';
import apiService from '../../../services/api';

const AssessmentsView = ({ user, token, userData, refreshData, loading, setCurrentView, showError, showSuccess }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taking, setTaking] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const { assessments, assessmentStats } = userData;
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Programming', 'English', 'History'];

  const handleStartAssessment = async (subject) => {
    if (!subject || subject.trim() === '') {
      showError('Please select a subject');
      return;
    }

    setCreating(true);
    try {
      const result = await apiService.generateAssessment(subject.trim(), token);
      console.log('Assessment generated successfully:', result);
      setCurrentAssessment(result);
      setAnswers(new Array(result.questions.length).fill(null));
      setTimeLeft(result.timeLimit);
      setTaking(true);
      setShowCreateModal(false);
      showSuccess(`${subject} assessment ready!`);
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      showError(`Failed to generate assessment: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

// Also replace the handleAnswerSelect function with this:

const handleAnswerSelect = (questionIndex, selectedAnswer) => {
  console.log('Answer selected:', { questionIndex, selectedAnswer });
  
  const newAnswers = [...answers];
  newAnswers[questionIndex] = {
    selectedAnswer: parseInt(selectedAnswer),
    timeSpent: 30000, // Mock time - you could implement real time tracking
    confidence: 'medium'
  };
  
  setAnswers(newAnswers);
  console.log('Updated answers array:', newAnswers);
};

const handleSubmitAssessment = async () => {
  try {
    console.log('=== Assessment Submission Debug ===');
    console.log('Current assessment:', currentAssessment);
    console.log('Raw answers:', answers);
    
    // Validate we have an assessment and answers
    if (!currentAssessment?.assessmentId) {
      showError('No assessment ID found');
      return;
    }
    
    if (!answers || answers.length === 0) {
      showError('Please answer at least one question');
      return;
    }
    
    // Convert assessment ID to number
    const assessmentId = parseInt(currentAssessment.assessmentId);
    console.log('Parsed assessment ID:', assessmentId);
    
    if (isNaN(assessmentId) || assessmentId <= 0) {
      showError('Invalid assessment ID');
      return;
    }
    
    // Filter out null answers and format properly
    const validAnswers = answers
      .map((answer, index) => {
        if (answer === null || answer === undefined) {
          return {
            selectedAnswer: 0, // Default to first option if not answered
            timeSpent: 30000,
            confidence: 'medium'
          };
        }
        return {
          selectedAnswer: parseInt(answer.selectedAnswer) || 0,
          timeSpent: parseInt(answer.timeSpent) || 30000,
          confidence: answer.confidence || 'medium'
        };
      });
    
    console.log('Formatted answers:', validAnswers);
    
    // Calculate total time spent
    const totalTimeSpent = currentAssessment.timeLimit - timeLeft;
    console.log('Total time spent:', totalTimeSpent);
    
    // Create final payload
    const payload = {
      assessmentId: assessmentId,
      answers: validAnswers,
      totalTimeSpent: Math.max(0, totalTimeSpent) // Ensure non-negative
    };
    
    console.log('Final submission payload:', payload);
    
    // Submit assessment
    const result = await apiService.submitAssessment(payload, token);
    
    console.log('Submission successful:', result);
    
    // Clean up and show success
    setTaking(false);
    setCurrentAssessment(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    
    showSuccess('Assessment submitted successfully!');
    refreshData();
    
  } catch (error) {
    console.error('Assessment submission failed:', error);
    showError(`Failed to submit assessment: ${error.message}`);
  }
};

  const AssessmentTaking = () => {
    const question = currentAssessment.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentAssessment.questions.length - 1;
    const canProceed = answers[currentQuestionIndex] !== null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Assessment in Progress</h2>
              <p className="text-white/70">
                Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">Time Left</div>
              <div className="text-2xl font-bold text-orange-400">
                {Math.floor(timeLeft / 60000)}:{String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    answers[currentQuestionIndex]?.selectedAnswer === index
                      ? 'bg-blue-500/20 border-blue-400 text-white'
                      : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestionIndex]?.selectedAnswer === index
                        ? 'border-blue-400 bg-blue-500'
                        : 'border-white/40'
                    }`}>
                      {answers[currentQuestionIndex]?.selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {/* Debug info */}
              <div className="text-white/70 text-sm">
                Answered: {answers.filter(a => a !== null).length}/{currentAssessment.questions.length}
              </div>
              
              {/* Debug button - remove in production */}
              <button
                onClick={async () => {
                  try {
                    const assessmentId = parseInt(currentAssessment.assessmentId);
                    const formattedAnswers = answers.map((answer, index) => ({
                      selectedAnswer: answer?.selectedAnswer || 0,
                      timeSpent: answer?.timeSpent || 30000,
                      confidence: answer?.confidence || 'medium'
                    }));
                    
                    const testData = {
                      assessmentId: assessmentId,
                      answers: formattedAnswers,
                      totalTimeSpent: currentAssessment.timeLimit - timeLeft
                    };
                    
                    console.log('Testing with debug endpoint...');
                    const result = await apiService.debugSubmitAssessment(testData, token);
                    console.log('Debug result:', result);
                    showSuccess('Debug test successful! Check console.');
                  } catch (error) {
                    console.error('Debug test failed:', error);
                    showError(`Debug test failed: ${error.message}`);
                  }
                }}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
              >
                Debug
              </button>
              
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitAssessment}
                  disabled={!canProceed}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={!canProceed}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateAssessmentModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Start Assessment</h3>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-white/70 mb-6">
          Choose a subject to test your knowledge and get personalized insights
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => {
                console.log('Assessment subject clicked:', subject);
                console.log('Assessment subject type:', typeof subject);
                console.log('Assessment subject length:', subject.length);
                handleStartAssessment(subject);
              }}
              disabled={creating}
              className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-left transition-all border border-white/20 hover:border-white/30 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{subject}</span>
                <Target className="w-4 h-4 text-blue-400" />
              </div>
            </button>
          ))}
        </div>

        {creating && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/70">Generating assessment questions...</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Assessments</h1>
          <p className="text-white/70">
            Track your progress and identify areas for improvement
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Debug button - remove in production */}
          <button
            onClick={async () => {
              try {
                console.log('=== Direct Assessment Test ===');
                const testResult = await apiService.generateAssessment('Mathematics', token);
                showSuccess('Assessment test successful!');
                console.log('Assessment test result:', testResult);
              } catch (error) {
                showError(`Assessment test failed: ${error.message}`);
                console.error('Assessment test error:', error);
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm"
          >
            Debug Test
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{assessmentStats.totalAssessments || 0}</div>
              <div className="text-white/70 text-sm">total</div>
            </div>
          </div>
          <div className="text-white/90 font-medium">Assessments Taken</div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{assessmentStats.averageScore || 0}%</div>
              <div className="text-white/70 text-sm">average</div>
            </div>
          </div>
          <div className="text-white/90 font-medium">Overall Score</div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{assessmentStats.strongestSubjects?.length || 0}</div>
              <div className="text-white/70 text-sm">subjects</div>
            </div>
          </div>
          <div className="text-white/90 font-medium">Strong Areas</div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{assessmentStats.weakestSubjects?.length || 0}</div>
              <div className="text-white/70 text-sm">areas</div>
            </div>
          </div>
          <div className="text-white/90 font-medium">Needs Focus</div>
        </div>
      </div>

      {/* Recent Assessments */}
      {assessments && assessments.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Assessments</h2>
          <div className="space-y-4">
            {assessments.slice(0, 5).map(assessment => (
              <div key={assessment.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      assessment.analysis?.overallScore >= 80 ? 'bg-green-500/20' :
                      assessment.analysis?.overallScore >= 60 ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}>
                      {assessment.analysis ? (
                        <CheckCircle className={`w-6 h-6 ${
                          assessment.analysis.overallScore >= 80 ? 'text-green-400' :
                          assessment.analysis.overallScore >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`} />
                      ) : (
                        <Clock className="w-6 h-6 text-orange-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{assessment.subject}</h3>
                      <p className="text-white/70 text-sm">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {assessment.analysis && (
                      <div className="text-center">
                        <div className="text-white font-semibold text-xl">
                          {assessment.analysis.overallScore}%
                        </div>
                        <div className="text-white/70 text-sm">Score</div>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors p-2">
                        <BarChart3 className="w-5 h-5" />
                      </button>
                      {assessment.analysis && (
                        <button className="text-orange-400 hover:text-orange-300 transition-colors p-2">
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {assessment.analysis && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-white/70 text-sm">Strong Areas</div>
                        <div className="text-white font-medium">
                          {assessment.analysis.strongAreas?.slice(0, 2).join(', ') || 'None identified'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/70 text-sm">Weak Areas</div>
                        <div className="text-white font-medium">
                          {assessment.analysis.weakAreas?.slice(0, 2).join(', ') || 'None identified'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/70 text-sm">Questions</div>
                        <div className="text-white font-medium">{assessment.questions?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-white/70 text-sm">Completion</div>
                        <div className="text-white font-medium">
                          {assessment.analysis ? '100%' : 'In Progress'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
          <Target className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No assessments yet</h3>
          <p className="text-white/70 mb-6">
            Take your first assessment to discover your strengths and areas for improvement
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all inline-flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Take Your First Assessment</span>
          </button>
        </div>
      )}

      {/* Performance Insights */}
      {assessmentStats.subjectBreakdown && Object.keys(assessmentStats.subjectBreakdown).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Performance by Subject</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(assessmentStats.subjectBreakdown).map(([subject, data]) => (
                <div key={subject} className="text-center">
                  <h3 className="text-white font-semibold mb-2">{subject}</h3>
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-400"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${data.averageScore}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold">{Math.round(data.averageScore)}%</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">{data.count} assessment{data.count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(assessmentStats.weakestSubjects?.length > 0 || assessmentStats.strongestSubjects?.length > 0) && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessmentStats.weakestSubjects?.length > 0 && (
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-500/20 p-3 rounded-xl">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Areas to Focus</h3>
                    <p className="text-white/70 text-sm">Subjects needing attention</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {assessmentStats.weakestSubjects.slice(0, 3).map(subject => (
                    <div key={subject} className="text-white/90">{subject}</div>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentView('courses')}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all"
                >
                  Generate Focused Courses
                </button>
              </div>
            )}

            {assessmentStats.strongestSubjects?.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Your Strengths</h3>
                    <p className="text-white/70 text-sm">Areas where you excel</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {assessmentStats.strongestSubjects.slice(0, 3).map(subject => (
                    <div key={subject} className="text-white/90">{subject}</div>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentView('courses')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Advanced Courses
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateAssessmentModal />}
      {taking && currentAssessment && <AssessmentTaking />}
    </div>
  );
};

export default AssessmentsView;