'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <div className="mb-6">
          <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong!</h1>
          <p className="text-gray-400 mb-4">
            We encountered an unexpected error. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-left">
              <p className="text-red-200 text-sm font-mono">{error.message}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-purple-600 text-white hover:bg-purple-700">
            <FaRedo className="w-4 h-4 mr-2" />
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
  );
}
