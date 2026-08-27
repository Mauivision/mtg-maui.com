'use client';

import React from 'react';
import Link from 'next/link';
import { FaHome, FaTrophy, FaMagic, FaCalendar, FaUsers, FaInfoCircle } from 'react-icons/fa';

const nav = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'Decks', href: '/decks', icon: FaMagic, highlight: true },
  { name: 'Leaderboard', href: '/leaderboard', icon: FaTrophy },
  { name: 'Events', href: '/events', icon: FaCalendar },
  { name: 'Leagues', href: '/leagues', icon: FaUsers },
  { name: 'About', href: '/about', icon: FaInfoCircle },
];

export const ModernHeader: React.FC = () => {
  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 shadow-xl sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center space-x-2.5 group transition-all duration-200 hover:scale-[1.02]">
            <span className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Maui League
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                    item.highlight
                      ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'text-white hover:text-amber-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <nav className="lg:hidden flex flex-wrap gap-2 py-3 border-t border-slate-800" aria-label="Mobile navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-700/50"
              >
                <Icon className="w-4 h-4" aria-hidden />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
