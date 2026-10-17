import React from 'react';

const ProgressBar = ({
  percentage = 0,
  showLabel = true,
  height = 'h-2.5',
  showStatus = false,
}) => {
  const cleanPercentage = Math.min(100, Math.max(0, Number(percentage) || 0));

  let colorClass = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  let badgeText = 'Safe (≥75%)';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (cleanPercentage < 60) {
    colorClass = 'bg-rose-500';
    textColor = 'text-rose-700';
    badgeText = 'Critical (<60%)';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (cleanPercentage < 75) {
    colorClass = 'bg-amber-500';
    textColor = 'text-amber-700';
    badgeText = 'Warning (<75%)';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        {showLabel && (
          <span className={`font-semibold ${textColor}`}>
            {cleanPercentage}%
          </span>
        )}
        {showStatus && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeBg}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}>
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${cleanPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
