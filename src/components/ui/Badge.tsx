import React from 'react';
import { cn } from '../../utils/cn';
import type { LearningPathway, DifficultyLevel } from '../../../types/database.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'indigo' | 'mint' | 'coral' | 'amber' | 'slate' | 'brand' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-brand-50 text-brand-700 border-brand-200/80',
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    coral: 'bg-rose-50 text-rose-700 border-rose-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const PathwayBadge: React.FC<{ pathway: LearningPathway | string; className?: string }> = ({
  pathway,
  className,
}) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    foundation: { label: 'Foundation', variant: 'indigo' },
    pre_sat: { label: 'Pre-SAT', variant: 'mint' },
    sat_advanced: { label: 'SAT Advanced', variant: 'coral' },
  };

  const info = map[pathway] || { label: pathway, variant: 'default' };
  return (
    <Badge variant={info.variant} className={className}>
      {info.label}
    </Badge>
  );
};

export const DifficultyBadge: React.FC<{
  difficulty: DifficultyLevel | string;
  className?: string;
}> = ({ difficulty, className }) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    easy: { label: 'Easy', variant: 'mint' },
    medium: { label: 'Medium', variant: 'amber' },
    hard: { label: 'Hard', variant: 'coral' },
  };

  const info = map[difficulty] || { label: difficulty, variant: 'default' };
  return (
    <Badge variant={info.variant} size="sm" className={className}>
      {info.label}
    </Badge>
  );
};
