'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'blur' | 'combined';
  duration?: number;
}

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 * Enhanced page transition with multiple animation types and smooth direction detection
 */
export function PageTransition({
  children,
  type = 'combined',
  duration = 300,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState<TransitionState>('entered');
  const previousPathnameRef = useRef<string>(pathname);
  const directionRef = useRef<'forward' | 'backward'>('forward');

  useEffect(() => {
    const pathDepth = pathname.split('/').length;
    const prevPathDepth = previousPathnameRef.current.split('/').length;
    directionRef.current = pathDepth > prevPathDepth ? 'forward' : 'backward';

    setTransitionState('exiting');

    let enterTimer: ReturnType<typeof setTimeout> | null = null;
    const exitTimer = setTimeout(() => {
      setDisplayChildren(children);
      previousPathnameRef.current = pathname;
      setTransitionState('entering');

      enterTimer = setTimeout(() => {
        setTransitionState('entered');
      }, duration);
    }, duration / 2);

    return () => {
      clearTimeout(exitTimer);
      if (enterTimer) clearTimeout(enterTimer);
    };
  }, [pathname, children, duration]);

  const getTransitionClasses = () => {
    const baseClasses = 'w-full transition-all duration-300 ease-out';
    const direction = directionRef.current;

    switch (type) {
      case 'fade':
        return `${baseClasses} ${
          transitionState === 'entering' || transitionState === 'entered'
            ? 'opacity-100'
            : 'opacity-0'
        }`;

      case 'slide':
        const slideX =
          direction === 'forward'
            ? transitionState === 'entering' || transitionState === 'entered'
              ? 'translate-x-0'
              : 'translate-x-full'
            : transitionState === 'entering' || transitionState === 'entered'
              ? 'translate-x-0'
              : '-translate-x-full';
        return `${baseClasses} ${slideX} ${
          transitionState === 'entering' || transitionState === 'entered'
            ? 'opacity-100'
            : 'opacity-0'
        }`;

      case 'scale':
        return `${baseClasses} ${
          transitionState === 'entering' || transitionState === 'entered'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`;

      case 'blur':
        return `${baseClasses} ${
          transitionState === 'entering' || transitionState === 'entered'
            ? 'opacity-100 blur-0'
            : 'opacity-0 blur-sm'
        }`;

      case 'combined':
        const combinedX =
          direction === 'forward'
            ? transitionState === 'entering' || transitionState === 'entered'
              ? 'translate-x-0'
              : 'translate-x-4'
            : transitionState === 'entering' || transitionState === 'entered'
              ? 'translate-x-0'
              : '-translate-x-4';
        return `${baseClasses} ${combinedX} ${
          transitionState === 'entering' || transitionState === 'entered'
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-98 blur-sm'
        }`;

      default:
        return baseClasses;
    }
  };

  return (
    <div key={pathname} className={getTransitionClasses()} style={{ transitionDuration: `${duration}ms` }}>
      {displayChildren}
    </div>
  );
}
