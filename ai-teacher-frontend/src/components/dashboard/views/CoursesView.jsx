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
  Sparkles
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import apiService from '../../../services/api';

const CoursesView = ({ user, token, userData, refreshData, loading, showError, showSuccess }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleCreatePersonalizedCourse = async (subject) => {
    console.log('=== Course Creation Debug ===');
    console.log('Received subject:', subject);
    console.log('Subject type:', typeof subject);
    console.log('Subject length:', subject ? subject.length : 'N/A');
    console.log('Subject after trim:', subject ? subject.trim() : 'N/A');
    console.log('Is subject truthy:', !!subject);
    console.log('Is subject empty after trim:', !subject || subject.trim() === '');
    
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      console.error('Subject validation failed');
      showError('Please select a valid subject');
      return;
    }

    const trimmedSubject = subject.trim();
    console.log('Final subject to send:', trimmedSubject);

    setCreating(true);
    try {
      const result = await apiService.generatePersonalizedCourse(trimmedSubject, token);
      console.log('Course created successfully:', result);
      showSuccess(`Successfully created ${trimmedSubject} course!`);
      refreshData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create course:', error);
      showError(`Failed to create course: ${error.message}`);
    } finally {
      setCreating(false);
    }
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
              onClick={() => {
                console.log('Subject clicked:', subject);
                console.log('Subject type:', typeof subject);
                console.log('Subject length:', subject.length);
                handleCreatePersonalizedCourse(subject);
              }}
              disabled={creating}
              className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-left transition-all border border-white/20 hover:border-white/30 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{subject}</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </button>
          ))}
        </div>

        {creating && (
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
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
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
              <CourseCard key={course.id} course={course} />
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
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
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
    </div>
  );
};

export default CoursesView;