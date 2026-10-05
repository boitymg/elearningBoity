'use client';

import React from 'react';

export interface ProgressProps {
  value: number; // 0 à 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'blue' | 'emerald';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color = 'orange',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorStyles = {
    orange: 'bg-[#EE9B00]',
    blue: 'bg-[#0B4F9C]',
    emerald: 'bg-emerald-500',
  }[color];

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-slate-900">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightStyles}`}>
        <div
          className={`${colorStyles} ${heightStyles} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
