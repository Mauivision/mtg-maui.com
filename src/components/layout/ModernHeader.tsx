'use client';

import React from 'react';
import Link from 'next/link';
import { FaHome, FaTrophy, FaDice, FaNewspaper } from 'react-icons/fa';

const nav = [
  { name: 'Home', href: '/', anchor: '#hero', icon: FaHome },
  { name: 'Leaderboard', href: '/#leaderboard', anchor: '#leaderboard', icon: FaTrophy },
  { name: 'Character Charts', href: '/#character-charts', anchor: '#character-charts', icon: FaDice },
  { name: 'News Feed', href: '/#news-feed', anchor: '#news-feed', icon: FaNewspaper },
];

export const ModernHeader: React.FC = () => {
  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 shadow-xl sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link
            href="/"
            className="flex items-center space-x-2.5 group transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 flex items-center justify-center">
              <span className="text-amber-200 font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Maui League
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.anchor}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:text-amber-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {item.name}
                </a>
              );
            })}
          </nav>

          <Link
            href="/wizards"
            className="text-slate-400 hover:text-amber-400 focus:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded text-sm font-medium transition-colors"
          >
            Edit
          </Link>
        </div>

<nav className="md:hidden flex flex-wrap gap-2 py-3 border-t border-slate-800" aria-label="Mobile navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.anchor}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {item.name}
                </a>
              );
            })}
          <Link href="/wizards" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-amber-400 focus:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950">
            Edit
          </Link>
        </nav>
      </div>
    </header>
  );
};
