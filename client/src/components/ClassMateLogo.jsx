import React from 'react';

/**
 * ClassMate Official Branding Logo Component
 * Incorporates the Smart Attendance Radar & College Intelligence emblem.
 * Supports light/dark variants and customizable sizes.
 */
export const ClassMateLogo = ({
  size = 'md',
  showText = true,
  variant = 'light', // 'light' (for dark backgrounds) or 'dark' (for light backgrounds)
  className = '',
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Smart Radar & Graduation Cap Emblem */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-2 shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-white"
        >
          {/* Radar Waves / Concentric Signal Rings */}
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.45"
          />
          <circle
            cx="12"
            cy="12"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity="0.7"
          />
          {/* Central Graduation Cap / Knowledge Beacon */}
          <path
            d="M12 4L3 8.5L12 13L21 8.5L12 4Z"
            fill="currentColor"
          />
          <path
            d="M6 10.5V15C6 17.5 8.7 19.5 12 19.5C15.3 19.5 18 17.5 18 15V10.5L12 13.5L6 10.5Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          {/* Graduation Tassel & Radar Signal Pulse Dot */}
          <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
          <path
            d="M20.5 9.5V14.5"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Animated Radar Pulse Ring (subtle) */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span
              className={`font-black tracking-tight ${textSizes[size]} ${
                variant === 'light' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Class<span className="text-indigo-500">Mate</span>
            </span>
            <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
              Radar
            </span>
          </div>
          <span
            className={`font-medium tracking-normal ${subtextSizes[size]} ${
              variant === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Smart College Attendance
          </span>
        </div>
      )}
    </div>
  );
};

export default ClassMateLogo;
