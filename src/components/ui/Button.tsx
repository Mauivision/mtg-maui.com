'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'outline'
    | 'default'
    | 'success'
    | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  fullWidth = false,
  ripple = true,
  glow = false,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500 active:scale-95',
    secondary:
      'bg-slate-700 text-gray-100 hover:bg-slate-600 hover:shadow-lg focus:ring-slate-500 active:scale-95',
    danger:
      'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 active:scale-95',
    ghost:
      'bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white focus:ring-slate-500 active:scale-95',
    outline:
      'border-2 border-slate-600 bg-slate-800 text-gray-100 hover:bg-slate-700 hover:border-purple-500 focus:ring-purple-500 active:scale-95',
    default:
      'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500 active:scale-95',
    success:
      'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 active:scale-95',
    warning:
      'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500 active:scale-95',
  };

  const glowClasses = {
    primary: 'hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]',
    secondary: 'hover:shadow-[0_0_15px_rgba(148,163,184,0.4)]',
    danger: 'hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]',
    ghost: '',
    outline: 'hover:shadow-[0_0_15px_rgba(147,51,234,0.4)]',
    default: 'hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]',
    success: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]',
    warning: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !isDisabled && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple: Ripple = {
        x,
        y,
        id: rippleIdRef.current++,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        glow ? glowClasses[variant] : ''
      } ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effect */}
      {ripple && (
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </span>
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </span>

      {/* Shine effect on hover */}
      {isHovered && !isDisabled && (
        <span className="absolute inset-0 -translate-x-full translate-y-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
      )}
    </button>
  );
};
