// src/components/dashboard/components/QuickActionCard.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient, 
  borderColor, 
  action, 
  buttonText = "Get Started",
  disabled = false
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} backdrop-blur-lg rounded-2xl p-6 border ${borderColor} hover:scale-[1.02] transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="flex items-start space-x-4 mb-6">
        <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      
      <button
        onClick={disabled ? undefined : action}
        disabled={disabled}
        className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 group-hover:bg-white/30 disabled:cursor-not-allowed"
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default QuickActionCard;