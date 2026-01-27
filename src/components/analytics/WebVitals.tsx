'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function WebVitals() {
  useEffect(() => {
    // Basic performance monitoring
    if (typeof window !== 'undefined') {
      // Monitor navigation timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logger.performance('Page Load', navigation.loadEventEnd - navigation.fetchStart, {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          });
        }
      });

      // Monitor largest contentful paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            logger.performance('LCP (Largest Contentful Paint)', lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // Silently fail if not supported
        }
      }

      // Monitor first input delay
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              // Type guard for PerformanceEventTiming
              if ('processingStart' in entry) {
                logger.performance('FID (First Input Delay)', (entry as any).processingStart - entry.startTime);
              }
            });
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // Silently fail if not supported
        }
      }
    }
  }, []);

  return null;
}