import React from 'react';

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'hover:border-indigo-200',
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'hover:border-emerald-200',
  },
  rose: {
    bg: 'bg-rose-50 text-rose-600',
    border: 'hover:border-rose-200',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600',
    border: 'hover:border-amber-200',
  },
  sky: {
    bg: 'bg-sky-50 text-sky-600',
    border: 'hover:border-sky-200',
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badge,
}) => {
  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              {value}
            </h3>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bg}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
