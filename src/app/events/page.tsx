'use client';

import React from 'react';
import Link from 'next/link';
import { LeagueHqShell } from '@/components/league-hq/LeagueHqShell';
import { getDemoEvents } from '@/lib/league-hq';

export default function EventsPage() {
  const events = getDemoEvents();

  return (
    <LeagueHqShell
      badge="Season 4"
      title="Events"
      subtitle="Upcoming league nights — not a live calendar sync."
    >
      <ul className="space-y-4">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-white">{ev.title}</h2>
              <time className="text-sm text-amber-400/90" dateTime={ev.date}>
                {new Date(ev.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
            {ev.location && <p className="mt-1 text-xs text-slate-500">{ev.location}</p>}
            {ev.description && <p className="mt-2 text-sm text-slate-400">{ev.description}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-slate-500">
        Manage leagues and add your own schedule notes on{' '}
        <Link href="/leagues" className="text-amber-400 hover:text-amber-300">
          Leagues
        </Link>
        .
      </p>
    </LeagueHqShell>
  );
}
