// src/components/dashboard/views/CoursesView.jsx
import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Clock,
  Target,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import apiService from '../../../services/api';
import LatexRenderer, { MixedContent } from '../../ui/LatexRenderer';

const CoursesView = ({ user, token, userData, refreshData, loading, showError, showSuccess }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Course viewing states
  const [viewingCourse, setViewingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const { courses } = userData;

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Programming', 'English', 'History'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || course.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  }) || [];

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

  const handleGenerateCourse = async (subject) => {
    if (!subject || subject.trim() === '') {
      showError('Please select a subject');
      return;
    }

    setGenerating(true);
    try {
      const result = await apiService.generatePersonalizedCourse(
        subject.trim(),
        token,
        {
          difficulty: 'intermediate',
        }
      );

      console.log('Course generated successfully:', result);
      showSuccess(`${subject} course created successfully!`);
      refreshData();
      setShowCreateModal(false);

    } catch (error) {
      console.error('Failed to generate course:', error);
      showError(`Failed to generate course: ${error.message}`);
    } finally {
      setGenerating(false);
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
                    <MixedContent className="text-white/90">
                      {currentModule.content}
                    </MixedContent>
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
                        Question {index + 1}: <LatexRenderer inline>{exercise.question}</LatexRenderer>
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
                              <span className="text-white/90"><LatexRenderer inline>{option}</LatexRenderer></span>
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
                    className={`w-2 h-2 rounded-full transition-all ${index === currentModuleIndex
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
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateCourseModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Generate AI Course</h3>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-white/70 mb-6">
          Choose a subject to generate a personalized course based on your learning profile
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => handleGenerateCourse(subject)}
              disabled={generating}
              className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-left transition-all border border-white/20 hover:border-white/30 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{subject}</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </button>
          ))}
        </div>

        {generating && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/70">Generating your personalized course...</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-white/70">
            {courses?.length || 0} courses • {courses?.filter(c => c.progress?.totalProgress === 100).length || 0} completed
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Generate Course</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Levels</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading courses...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
          <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">
            {courses?.length === 0 ? 'No courses yet' : 'No courses found'}
          </h3>
          <p className="text-white/70 mb-6">
            {courses?.length === 0
              ? 'Generate your first AI-powered course to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {courses?.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Generate Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredCourses.map(course => (
            viewMode === 'grid' ? (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={handleContinueCourse}
                showProgress={true}
              />
            ) : (
              <div key={course.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{course.title}</h3>
                      <p className="text-white/70">{course.subject} • {course.difficulty}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-white font-semibold">{course.modules?.length || 0}</div>
                      <div className="text-white/70 text-sm">Modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">{course.progress?.totalProgress || 0}%</div>
                      <div className="text-white/70 text-sm">Complete</div>
                    </div>
                    <button
                      onClick={() => handleContinueCourse(course)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && <CreateCourseModal />}

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

export default CoursesView;