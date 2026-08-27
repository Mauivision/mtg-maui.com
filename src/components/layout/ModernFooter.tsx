'use client';

import React from 'react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/decks', label: 'Decks' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/events', label: 'Events' },
  { href: '/leagues', label: 'Leagues' },
  { href: '/about', label: 'About' },
  { href: '/join', label: 'Join' },
];

export const ModernFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950/95 border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MTG Maui League</span>
            <span className="text-slate-500 text-sm">· Season 4</span>
          </div>
          <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
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
            © {new Date().getFullYear()} MTG Maui League. Casual Chaos Commander — Maui, Hawai&apos;i.
          </p>
        </div>
      </div>
    </footer>
  );
};
