// src/components/dashboard/views/ProgressView.jsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target, 
  BookOpen,
  Clock,
  Zap,
  BarChart3,
  Trophy,
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';

const ProgressView = ({ user, userData, loading }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const { userStats, assessmentStats, courseStats } = userData;

  const timeRanges = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: '3 Months' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Programming'];

  const ProgressCard = ({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600'
    };

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-r ${colorClasses[color]} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-green-500/20 text-green-400' : 
              trend < 0 ? 'bg-red-500/20 text-red-400' : 
              'bg-gray-500/20 text-gray-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mb-2">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-white/70 text-sm">{subtitle}</div>
        </div>
        <div className="text-white/90 font-medium">{title}</div>
      </div>
    );
  };

  const LearningStreakCalendar = () => {
    // Mock data for demonstration
    const days = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      active: Math.random() > 0.3,
      intensity: Math.floor(Math.random() * 4) + 1
    }));

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">Learning Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-white/70 text-xs font-medium p-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                day.active
                  ? day.intensity === 1 ? 'bg-blue-500/20 text-blue-400'
                  : day.intensity === 2 ? 'bg-blue-500/40 text-blue-300'
                  : day.intensity === 3 ? 'bg-blue-500/60 text-blue-200'
                  : 'bg-blue-500/80 text-white'
                  : 'bg-white/10 text-white/50'
              }`}
              title={day.date.toDateString()}
            >
              {day.date.getDate()}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-white/70">Less</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-white/10"></div>
            <div className="w-3 h-3 rounded bg-blue-500/20"></div>
            <div className="w-3 h-3 rounded bg-blue-500/40"></div>
            <div className="w-3 h-3 rounded bg-blue-500/60"></div>
            <div className="w-3 h-3 rounded bg-blue-500/80"></div>
          </div>
          <span className="text-white/70">More</span>
        </div>
      </div>
    );
  };

  const SubjectProgressChart = () => {
    const subjectData = assessmentStats.subjectBreakdown || {};
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-6">Subject Performance</h3>
        <div className="space-y-4">
          {Object.entries(subjectData).map(([subject, data]) => (
            <div key={subject}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{subject}</span>
                <span className="text-white/70">{Math.round(data.averageScore)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.averageScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RecentAchievements = () => {
    // Mock achievements data
    const achievements = [
      { id: 1, title: 'First Assessment', description: 'Completed your first assessment', icon: Target, date: '2 days ago', color: 'blue' },
      { id: 2, title: 'Course Completion', description: 'Finished Introduction to Physics', icon: BookOpen, date: '1 week ago', color: 'green' },
      { id: 3, title: 'Learning Streak', description: '7 days of continuous learning', icon: Zap, date: '1 week ago', color: 'orange' },
      { id: 4, title: 'High Score', description: 'Scored 95% on Mathematics assessment', icon: Trophy, date: '2 weeks ago', color: 'purple' }
    ];

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">Recent Achievements</h3>
          <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {achievements.map(achievement => (
            <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <div className={`bg-gradient-to-r ${
                achievement.color === 'blue' ? 'from-blue-500 to-blue-600' :
                achievement.color === 'green' ? 'from-green-500 to-green-600' :
                achievement.color === 'orange' ? 'from-orange-500 to-orange-600' :
                'from-purple-500 to-purple-600'
              } w-10 h-10 rounded-xl flex items-center justify-center`}>
                <achievement.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{achievement.title}</h4>
                <p className="text-white/70 text-sm">{achievement.description}</p>
              </div>
              <div className="text-white/50 text-sm">{achievement.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-white">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learning Progress</h1>
          <p className="text-white/70">Track your learning journey and achievements</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {timeRanges.map(range => (
              <option key={range.id} value={range.id}>{range.label}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          icon={BookOpen}
          title="Courses Completed"
          value={userStats.completedCourses || 0}
          subtitle={`of ${userStats.totalCourses || 0} enrolled`}
          trend={15}
          color="blue"
        />
        <ProgressCard
          icon={Target}
          title="Average Score"
          value={`${assessmentStats.averageScore || 0}%`}
          subtitle="across all assessments"
          trend={8}
          color="green"
        />
        <ProgressCard
          icon={Zap}
          title="Learning Streak"
          value={userStats.learningStreak || 0}
          subtitle="consecutive days"
          trend={-2}
          color="orange"
        />
        <ProgressCard
          icon={Trophy}
          title="Achievements"
          value="12"
          subtitle="badges earned"
          trend={25}
          color="purple"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningStreakCalendar />
        <SubjectProgressChart />
      </div>

      {/* Performance Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-6">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-400"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(userStats.completedCourses || 0) / Math.max(userStats.totalCourses || 1, 1) * 100}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {Math.round((userStats.completedCourses || 0) / Math.max(userStats.totalCourses || 1, 1) * 100)}%
                </span>
              </div>
            </div>
            <h4 className="text-white font-semibold mb-1">Course Completion</h4>
            <p className="text-white/70 text-sm">Overall progress rate</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
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
                  strokeDasharray={`${assessmentStats.averageScore || 0}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{assessmentStats.averageScore || 0}%</span>
              </div>
            </div>
            <h4 className="text-white font-semibold mb-1">Assessment Average</h4>
            <p className="text-white/70 text-sm">Knowledge retention</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-400"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min((userStats.learningStreak || 0) * 3, 100)}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{userStats.learningStreak || 0}</span>
              </div>
            </div>
            <h4 className="text-white font-semibold mb-1">Study Consistency</h4>
            <p className="text-white/70 text-sm">Days streak</p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <RecentAchievements />

      {/* Learning Goals */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">Learning Goals</h3>
          <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
            Set New Goal
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Complete 5 Courses This Month</h4>
              <span className="text-blue-400 text-sm">3/5</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-white/70 text-sm">2 courses remaining • Due Dec 31</p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Maintain 80% Assessment Average</h4>
              <span className="text-green-400 text-sm">{assessmentStats.averageScore || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: `${Math.min((assessmentStats.averageScore || 0) / 80 * 100, 100)}%` }}></div>
            </div>
            <p className="text-white/70 text-sm">
              {(assessmentStats.averageScore || 0) >= 80 ? 'Goal achieved!' : `${80 - (assessmentStats.averageScore || 0)}% to go`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;