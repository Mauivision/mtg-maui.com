'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function ErrorReporter() {
  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      logger.error('Global error caught', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // In production, you would send this to an error tracking service
      // like Sentry, LogRocket, or Bugsnag
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason, {
        url: window.location.href,
      });

      // In production, you would send this to an error tracking service
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}