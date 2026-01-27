'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StaggeredRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Component that reveals children with a staggered animation
 */
export function StaggeredReveal({
  children,
  delay = 100,
  className = '',
  direction = 'up',
}: StaggeredRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
  };

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${directionClasses[direction]}`
      } ${className}`}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return (
            <div
              key={index}
              className="transition-all duration-700 ease-out"
              style={{
                transitionDelay: isVisible ? `${index * delay}ms` : '0ms',
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateY(0) translateX(0)'
                  : directionClasses[direction],
              }}
            >
              {child}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
}
