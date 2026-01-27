import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
  variant?: 'full' | 'overlay' | 'inline';
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  variant = 'full',
  className = '',
}) => {
  const variants = {
    full: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm',
    overlay:
      'absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm',
    inline: 'flex items-center justify-center py-8',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <p className="text-white text-lg font-medium animate-pulse">{message}</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};
