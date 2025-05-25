// src/components/dashboard/views/HomeView.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Zap, 
  ChevronRight,
  Plus,
  Play,
  Clock,
  Award,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CheckCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import QuickActionCard from '../components/QuickActionCard';
import apiService from '../../../services/api';

const HomeView = ({ user, userData, setCurrentView, loading, token, refreshData, showError, showSuccess }) => {
  const { courses, userStats, assessmentStats } = userData;
  
  // Course viewing states
  const [viewingCourse, setViewingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  // Handler for continuing/viewing a course
  const handleContinueCourse = (course) => {
    console.log('Continue course:', course);
    setSelectedCourse(course);
    
    // Find the current module based on progress
    if (course.progress && course.progress.currentModule) {
      const moduleIndex = course.modules.findIndex(m => m.id === course.progress.currentModule);
      setCurrentModuleIndex(moduleIndex >= 0 ? moduleIndex : 0);
    } else {
      setCurrentModuleIndex(0);
    }
    
    setViewingCourse(true);
  };

  // Handler for closing course view
  const handleCloseCourse = () => {
    setViewingCourse(false);
    setSelectedCourse(null);
    setCurrentModuleIndex(0);
  };

  // Handler for completing a module
  const handleCompleteModule = async (moduleId) => {
    try {
      const updateData = {
        moduleId: moduleId,
        completed: true,
        timeSpent: 300000, // 5 minutes - you can track actual time
      };
      
      await apiService.updateCourseProgress(selectedCourse.id, updateData, token);
      
      // Move to next module
      if (currentModuleIndex < selectedCourse.modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
      }
      
      showSuccess('Module completed!');
      refreshData(); // Refresh to update progress
    } catch (error) {
      console.error('Failed to update progress:', error);
      showError('Failed to update progress');
    }
  };

  // Course Viewer Component
  const CourseViewer = ({ course, currentModuleIndex, onClose, onCompleteModule, onNavigateModule }) => {
    const [showExercises, setShowExercises] = useState(false);
    const [exerciseAnswers, setExerciseAnswers] = useState({});
    
    if (!course || !course.modules || course.modules.length === 0) {
      return null;
    }

    const currentModule = course.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === course.modules.length - 1;
    const isFirstModule = currentModuleIndex === 0;

    const handleExerciseAnswer = (exerciseId, answer) => {
      setExerciseAnswers({
        ...exerciseAnswers,
        [exerciseId]: answer
      });
    };

    const handleSubmitExercises = () => {
      let correctCount = 0;
      currentModule.exercises.forEach(exercise => {
        if (exerciseAnswers[exercise.id] == exercise.correctAnswer) {
          correctCount++;
        }
      });

      const score = (correctCount / currentModule.exercises.length) * 100;
      showSuccess(`Module completed! Score: ${score.toFixed(0)}%`);
      
      onCompleteModule(currentModule.id);
      setExerciseAnswers({});
      setShowExercises(false);
    };

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <p className="text-white/70">Module {currentModuleIndex + 1} of {course.modules.length}: {currentModule.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              {!showExercises ? (
                // Module Content
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-3xl font-bold text-white mb-6">{currentModule.title}</h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white/90 whitespace-pre-wrap">
                      {currentModule.content}
                    </div>
                  </div>

                  {currentModule.exercises && currentModule.exercises.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/20">
                      <button
                        onClick={() => setShowExercises(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                      >
                        Start Exercises ({currentModule.exercises.length} questions)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Exercises
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Module Exercises</h2>
                  
                  {currentModule.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Question {index + 1}: {exercise.question}
                      </h3>
                      
                      {exercise.type === 'multiple-choice' && exercise.options && (
                        <div className="space-y-3">
                          {exercise.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`exercise-${exercise.id}`}
                                value={optionIndex}
                                checked={exerciseAnswers[exercise.id] == optionIndex}
                                onChange={() => handleExerciseAnswer(exercise.id, optionIndex)}
                                className="w-4 h-4 text-blue-500"
                              />
                              <span className="text-white/90">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {exercise.type === 'short-answer' && (
                        <input
                          type="text"
                          value={exerciseAnswers[exercise.id] || ''}
                          onChange={(e) => handleExerciseAnswer(exercise.id, e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                          placeholder="Your answer..."
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setShowExercises(false)}
                      className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                    >
                      Back to Content
                    </button>
                    <button
                      onClick={handleSubmitExercises}
                      disabled={Object.keys(exerciseAnswers).length < currentModule.exercises.length}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={() => onNavigateModule(currentModuleIndex - 1)}
                disabled={isFirstModule}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous Module</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {course.modules.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentModuleIndex
                        ? 'bg-blue-400 w-8'
                        : index < currentModuleIndex
                        ? 'bg-green-400'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => {
                  if (isLastModule) {
                    onClose();
                  } else {
                    onNavigateModule(currentModuleIndex + 1);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
                <span>{isLastModule ? 'Complete Course' : 'Next Module'}</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-white">Loading dashboard...</div>
      </div>
    );
  }

  const recentCourses = courses?.slice(0, 3) || [];
  const hasNoCourses = courses?.length === 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome back, 
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ml-3">
            {user.firstName}
          </span>!
        </h1>
        <p className="text-white/70 text-lg">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Courses"
          value={userStats.totalCourses || 0}
          subtitle="enrolled"
          color="blue"
        />
        <StatCard
          icon={Trophy}
          title="Completed"
          value={userStats.completedCourses || 0}
          subtitle="courses finished"
          color="green"
        />
        <StatCard
          icon={Target}
          title="Average Score"
          value={`${assessmentStats.averageScore || 0}%`}
          subtitle="assessment avg"
          color="purple"
        />
        <StatCard
          icon={Zap}
          title="Learning Streak"
          value={userStats.learningStreak || 0}
          subtitle="days active"
          color="orange"
        />
      </div>

      {/* Recent Activity or Get Started */}
      {hasNoCourses ? (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/20">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Learning Journey</h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Take a quick assessment to discover your strengths and weaknesses, then get personalized 
              courses tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentView('assessments')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>Take Assessment</span>
              </button>
              <button
                onClick={() => setCurrentView('courses')}
                className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Browse Courses</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Continue Learning Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Continue Learning</h2>
              <button
                onClick={() => setCurrentView('courses')}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 group"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onContinue={handleContinueCourse}
                  showProgress={true}
                />
              ))}
            </div>
          </div>

          {/* Recent Performance */}
          {assessmentStats.recentPerformance?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Performance</h2>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {assessmentStats.recentPerformance.slice(0, 3).map((assessment, index) => (
                    <div key={assessment.id} className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        assessment.score >= 80 ? 'bg-green-500/20 text-green-400' :
                        assessment.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <span className="text-xl font-bold">{assessment.score}%</span>
                      </div>
                      <h3 className="text-white font-semibold">{assessment.subject}</h3>
                      <p className="text-white/70 text-sm">
                        {new Date(assessment.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Take New Assessment"
          description="Discover your knowledge gaps and get personalized recommendations"
          icon={Target}
          gradient="from-blue-500/20 to-purple-600/20"
          borderColor="border-blue-500/30"
          action={() => setCurrentView('assessments')}
          buttonText="Start Assessment"
        />
        
        <QuickActionCard
          title="Generate Course"
          description="Create AI-powered courses tailored to your learning style"
          icon={Plus}
          gradient="from-purple-500/20 to-pink-600/20"
          borderColor="border-purple-500/30"
          action={() => setCurrentView('courses')}
          buttonText="Create Course"
        />
      </div>

      {/* Learning Insights */}
      {(userStats.totalCourses > 0 || assessmentStats.totalAssessments > 0) && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Learning Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Progress Rate</h3>
                  <p className="text-white/70 text-sm">Learning velocity</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {userStats.completedCourses > 0 ? 'Excellent' : 'Getting Started'}
              </div>
              <p className="text-white/70 text-sm">
                {userStats.completedCourses > 0 
                  ? 'You\'re making great progress!'
                  : 'Complete your first course to see insights'
                }
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Strongest Subject</h3>
                  <p className="text-white/70 text-sm">Your best area</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {assessmentStats.strongestSubjects?.[0] || 'Not determined'}
              </div>
              <p className="text-white/70 text-sm">
                {assessmentStats.strongestSubjects?.[0] 
                  ? 'Keep building on this strength!'
                  : 'Take assessments to identify strengths'
                }
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-orange-500/20 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Study Time</h3>
                  <p className="text-white/70 text-sm">This week</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {userStats.learningStreak > 0 ? `${userStats.learningStreak * 30}min` : '0min'}
              </div>
              <p className="text-white/70 text-sm">
                {userStats.learningStreak > 0 
                  ? 'Great consistency!'
                  : 'Start learning to track time'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Viewer Modal */}
      {viewingCourse && selectedCourse && (
        <CourseViewer
          course={selectedCourse}
          currentModuleIndex={currentModuleIndex}
          onClose={handleCloseCourse}
          onCompleteModule={handleCompleteModule}
          onNavigateModule={(index) => {
            if (index >= 0 && index < selectedCourse.modules.length) {
              setCurrentModuleIndex(index);
            }
          }}
        />
      )}
    </div>
  );
};

export default HomeView;