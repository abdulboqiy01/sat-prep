import React from 'react';
import { cn } from '../../utils/cn';
import type { CefrLevel } from '../../types/vocabulary.types';

interface CefrBadgeProps {
  level: CefrLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CefrBadge: React.FC<CefrBadgeProps> = ({ level, className, size = 'md' }) => {
  const colorMap: Record<CefrLevel, string> = {
    B2: 'bg-blue-50 text-blue-700 border-blue-200/80 font-bold',
    C1: 'bg-purple-50 text-purple-700 border-purple-200/80 font-bold',
    C2: 'bg-rose-50 text-rose-700 border-rose-200/80 font-extrabold',
  };

  const labelMap: Record<CefrLevel, string> = {
    B2: 'B2 • Upper-Intermediate',
    C1: 'C1 • Advanced Academic',
    C2: 'C2 • Master Proficiency',
  };

  const sizeClasses = {
    sm: 'text-2xs px-2 py-0.5 rounded-md border',
    md: 'text-xs px-2.5 py-1 rounded-lg border',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl border-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 uppercase tracking-wider shadow-2xs transition-colors',
        sizeClasses[size],
        colorMap[level] || 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
      title={`CEFR Level ${level} (SAT Reading & Writing)`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labelMap[level]}
    </span>
  );
};

