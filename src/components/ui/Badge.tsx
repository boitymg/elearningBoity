'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'type2' | 'type3' | 'publiee' | 'brouillon' | 'en_revision' | 'validee' | 'archivee' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  const variantStyles = {
    type2: 'bg-[#0B4F9C] text-white font-semibold',
    type3: 'bg-[#EE9B00] text-slate-950 font-bold',
    publiee: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    brouillon: 'bg-slate-100 text-slate-700 border border-slate-200',
    en_revision: 'bg-amber-50 text-amber-800 border border-amber-200',
    validee: 'bg-blue-50 text-blue-700 border border-blue-200',
    archivee: 'bg-slate-200 text-slate-600',
    default: 'bg-slate-100 text-slate-800',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium tracking-wide uppercase ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
