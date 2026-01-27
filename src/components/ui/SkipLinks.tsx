import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <nav aria-label="Skip navigation links" className="sr-only focus-within:not-sr-only">
      <div className="fixed top-4 left-4 z-50 space-y-2">
        <a
          href="#main-content"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          Skip to navigation
        </a>
      </div>
    </nav>
  );
};