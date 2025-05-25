// src/components/dashboard/components/CourseCard.jsx
import React from 'react';
import { BookOpen, Clock, Target, Play, Star, CheckCircle } from 'lucide-react';

const CourseCard = ({ course, onContinue, showProgress = true }) => {
  const progress = course.progress?.totalProgress || 0;
  const isCompleted = progress === 100;
  
  const handleContinueCourse = () => {
    if (onContinue) {
      onContinue(course);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <BookOpen className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg line-clamp-1">{course.title}</h3>
            <p className="text-white/70 text-sm">{course.subject}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {course.isPersonalized && (
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1 rounded-full text-white text-xs font-medium">
              AI Generated
            </div>
          )}
          {isCompleted && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full text-white text-xs font-medium">
              Completed
            </div>
          )}
        </div>
      </div>
      
      <p className="text-white/80 text-sm mb-4 line-clamp-2">{course.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm">{course.modules?.length || 0} modules</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm capitalize">{course.difficulty}</span>
          </div>
        </div>
      </div>
      
      {showProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Progress</span>
            <span className="text-white text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <button 
        onClick={handleContinueCourse}
        className={`w-full py-3 rounded-xl font-medium transition-all transform group-hover:scale-[1.02] flex items-center justify-center space-x-2 ${
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
        }`}
      >
        {isCompleted ? (
          <>
            <Star className="w-4 h-4" />
            <span>Review Course</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Continue Learning</span>
          </>
        )}
      </button>
    </div>
  );
};

export default CourseCard;