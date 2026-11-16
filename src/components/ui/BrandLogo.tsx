import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const capSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Educational Emblem Badge */}
      <div
        className={`${iconSizes[size]} relative bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25 ring-2 ring-white/80 shrink-0 group-hover:scale-105 transition-all duration-200`}
      >
        <GraduationCap className={`${capSizes[size]} -rotate-6 filter drop-shadow-xs`} />
        {/* Academic Excellence Sparkle */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
          <Sparkles className="w-2 h-2 text-amber-950" />
        </span>
      </div>

      {/* Brand Logotype */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight text-slate-900 ${textSizes[size]} flex items-center gap-1`}>
            <span>SAT</span>
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Prep
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Digital SAT Master
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
