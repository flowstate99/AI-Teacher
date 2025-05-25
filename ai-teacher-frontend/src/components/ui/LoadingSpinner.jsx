// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { Brain } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
        </div>
        <p className="text-white/70 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;