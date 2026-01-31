import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        <a
          href="#main-content"
          className="inline-flex w-fit rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-amber-500 focus:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Skip to main content
        </a>
        <a
          href="#leaderboard"
          className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-slate-600 focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Skip to leaderboard
        </a>
        <a
          href="#wave1-pods"
          className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-slate-600 focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Skip to pod results
        </a>
        <a
          href="#navigation"
          className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-slate-600 focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Skip to navigation
        </a>
      </div>
    </nav>
  );
};