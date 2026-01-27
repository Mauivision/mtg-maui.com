'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaHome,
  FaTrophy,
  FaBullhorn,
  FaClock,
  FaCog,
  FaMagic,
  FaDice,
  FaChartLine,
  FaCrown,
  FaBook,
} from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { AdventureLink } from '@/components/layout/AdventureLink';

const navigation = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'Leaderboard', href: '/leaderboard', icon: FaTrophy },
  { name: 'Analytics', href: '/analytics', icon: FaChartLine },
  { name: 'Commander', href: '/commander', icon: FaCrown },
  { name: 'Rules', href: '/rules', icon: FaBook },
  { name: 'Character Sheets', href: '/character-sheets', icon: FaDice },
  { name: 'Bulletin Board', href: '/bulletin', icon: FaBullhorn },
  { name: 'Coming Soon', href: '/coming-soon', icon: FaClock },
  { name: 'Wizards Control', href: '/wizards', icon: FaMagic, admin: true },
];

export const ModernHeader: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 shadow-xl sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo — Arena brand */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 group transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 shadow-lg flex items-center justify-center group-hover:border-amber-400/60 transition-colors">
              <span className="text-amber-200 font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
              Maui League
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <AdventureLink
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-amber-400 bg-amber-900/30 border border-amber-700 shadow-lg'
                      : 'text-white hover:text-amber-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </AdventureLink>
              );
            })}
            {/* Admin link */}
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/admin'
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/80'
              }`}
            >
              <FaCog className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-amber-300 hover:bg-slate-800/80">
                Sign In
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="sm" ripple className="bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/30 hover:from-amber-500 hover:to-amber-600">
                Join League
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-700 bg-slate-800">
        <nav className="px-4 py-2 space-y-1">
          {navigation
            .filter(item => !item.admin)
            .map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-amber-400 bg-amber-900/30 border border-amber-700'
                      : 'text-white hover:text-amber-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          <Link
            href="/wizards"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-amber-300 hover:bg-slate-800/80"
          >
            <FaMagic className="w-4 h-4" />
            <span>Wizards Control</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-amber-300 hover:bg-slate-800/80"
          >
            <FaCog className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
