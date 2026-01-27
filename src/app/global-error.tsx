'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <div className="mb-6">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
              <p className="text-gray-400 mb-4">
                A critical error occurred. Please refresh the page or contact support.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={reset} className="bg-purple-600 text-white hover:bg-purple-700">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
