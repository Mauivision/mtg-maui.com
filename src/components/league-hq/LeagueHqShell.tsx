'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface LeagueHqShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: string;
}

export function LeagueHqShell({ title, subtitle, children, badge }: LeagueHqShellProps) {
  return (
    <div className="min-h-[100dvh] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-3xl px-4 pt-2 sm:px-5 sm:pt-6">
        <header className="mb-8 text-center">
          <div className="mb-4 flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              <FaArrowLeft className="h-4 w-4" aria-hidden />
              Home
            </Link>
          </div>
          {badge && (
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-400/80">{badge}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">{subtitle}</p>}
          <div className="mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-slate-700" />
            <span className="text-amber-500/60">◆</span>
            <span className="h-px flex-1 bg-slate-700" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
