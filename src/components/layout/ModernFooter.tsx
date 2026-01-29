'use client';

import React from 'react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#leaderboard', label: 'Leaderboard' },
  { href: '/#character-charts', label: 'Character Charts' },
  { href: '/#news-feed', label: 'News Feed' },
  { href: '/wizards', label: 'Edit' },
];

export const ModernFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950/95 border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 flex items-center justify-center">
              <span className="text-amber-200 font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-white">MTG Maui League</span>
          </div>
          <nav className="flex flex-wrap gap-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-slate-400 hover:text-amber-400 text-sm transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} MTG Maui League. Hawaii&apos;s premier Magic league.
          </p>
        </div>
      </div>
    </footer>
  );
};
