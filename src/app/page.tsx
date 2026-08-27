'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBook, FaCalendar, FaTrophy, FaUsers } from 'react-icons/fa';
import { StandingsTable } from '@/components/league-hq/StandingsTable';
import {
  getDemoEvents,
  getDemoStandings,
  getDemoStats,
  SEASON4_DISCLAIMER,
  type LeagueHqStats,
} from '@/lib/league-hq';

const FALLBACK_STATS: LeagueHqStats = getDemoStats();

export default function HomePage() {
  const [stats, setStats] = useState<LeagueHqStats>(FALLBACK_STATS);
  const topStandings = getDemoStandings(5);
  const upcomingEvents = getDemoEvents().slice(0, 2);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const merged: LeagueHqStats = {
          totalUsers: d.totalUsers || FALLBACK_STATS.totalUsers,
          totalLeagues: d.totalLeagues || FALLBACK_STATS.totalLeagues,
          totalGames: d.totalGames || FALLBACK_STATS.totalGames,
          totalDrafts: d.totalDrafts || FALLBACK_STATS.totalDrafts,
          totalEvents: d.totalEvents ?? FALLBACK_STATS.totalEvents,
          newsCount: d.newsCount ?? FALLBACK_STATS.newsCount,
        };
        if (merged.totalUsers === 0 && merged.totalGames === 0) {
          setStats(FALLBACK_STATS);
        } else {
          setStats(merged);
        }
      })
      .catch(() => setStats(FALLBACK_STATS));
  }, []);

  return (
    <div className="min-h-screen">
      <section id="hero" className="border-b border-slate-800/60 py-16 md:py-20" aria-label="Hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-amber-400/90">Season 4 · Chaos Commander</p>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">MTG Maui League</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-300">
            Season 3 is finished. Season 4 is casual Commander pods and chaos drafts. League HQ, deck helper, and
            member-run leagues — no database required.
          </p>
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/decks"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/20"
            >
              <FaBook aria-hidden />
              Deck Builder
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-white hover:border-amber-500/40"
            >
              <FaTrophy aria-hidden />
              Leaderboard
            </Link>
          </div>

          <div className="mx-auto grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: FaUsers, value: stats.totalUsers, label: 'Players' },
              { icon: FaTrophy, value: stats.totalLeagues, label: 'Leagues' },
              { icon: FaCalendar, value: stats.totalGames, label: 'Games' },
              { icon: FaBook, value: stats.totalDrafts, label: 'Drafts' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon className="mb-2 h-5 w-5 text-amber-400" aria-hidden />
                <div className="text-xl font-bold tabular-nums text-white">{value}</div>
                <div className="text-xs uppercase text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800/60 py-12 md:py-16" aria-labelledby="home-standings">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">Season 4 · Standings</p>
            <h2 id="home-standings" className="mt-2 text-2xl font-bold text-white">
              Top scores
            </h2>
          </div>
          <StandingsTable rows={topStandings} compact disclaimer={SEASON4_DISCLAIMER} />
          <p className="mt-4 text-center">
            <Link href="/leaderboard" className="text-sm text-amber-400 hover:text-amber-300">
              Full leaderboard →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="home-events">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 id="home-events" className="mb-6 text-center text-xl font-bold text-white">
            Upcoming events
          </h2>
          <ul className="space-y-3">
            {upcomingEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <span className="font-medium text-slate-200">{ev.title}</span>
                <time className="text-sm text-slate-500" dateTime={ev.date}>
                  {new Date(ev.date).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/events" className="text-amber-400 hover:underline">
              All events
            </Link>
            {' · '}
            <Link href="/leagues" className="text-amber-400 hover:underline">
              Run a league
            </Link>
            {' · '}
            <Link href="/about" className="text-amber-400 hover:underline">
              Season 4 rules
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
