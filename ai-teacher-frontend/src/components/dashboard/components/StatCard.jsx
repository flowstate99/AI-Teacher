import React from 'react';

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
    teal: "from-teal-500 to-teal-600"
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] group">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-r ${colorClasses[color]} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {value}
          </div>
          <div className="text-white/70 text-sm">{subtitle}</div>
        </div>
      </div>
      <div className="text-white/90 font-medium">{title}</div>
    </div>
  );
};

export default StatCard;