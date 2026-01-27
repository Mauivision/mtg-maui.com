'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Page progress indicator that shows a progress bar at the top of the page
 * during navigation and page loads.
 */
export function PageProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsVisible(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 90;
        }
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 50);

    const completeTimer = setTimeout(() => setProgress(100), 300);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-[width] duration-200 ease-out shadow-lg"
        style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)' }}
      />
    </div>
  );
}
