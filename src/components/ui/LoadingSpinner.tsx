import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {text ? <p className="text-sm text-slate-400">{text}</p> : <span className="sr-only">Loading</span>}
    </div>
  );
};
