// src/components/dashboard/views/HomeView.jsx
import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import QuickActionCard from '../components/QuickActionCard';

const HomeView = ({ user, userData, setCurrentView, loading }) => {
  const { courses, userStats, assessmentStats } = userData;

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
                <CourseCard key={course.id} course={course} />
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
    </div>
  );
};

export default HomeView;