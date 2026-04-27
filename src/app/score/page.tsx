'use client';

import React from 'react';
import Link from 'next/link';
import { useLeague } from '@/contexts/LeagueContext';
import { CommanderScoring } from '@/components/commander/CommanderScoring';
import { LeagueStatus } from '@/components/league/LeagueStatus';
import { LeagueFullScoresTable } from '@/components/leaderboard/LeagueFullScoresTable';
import { SimpleLeaderboardChart } from '@/components/leaderboard/SimpleLeaderboardChart';
import { DraftPointsChart } from '@/components/leaderboard/DraftPointsChart';
import { Wave1PodResults } from '@/components/leaderboard/Wave1PodResults';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';

const sectionClass = 'scroll-mt-20 border-b border-slate-800/60 py-12 md:py-16';

export default function ScorePage() {
  const { currentLeague, leagues, setCurrentLeague } = useLeague();

  return (
    <div className="min-h-[100dvh] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-5 sm:pt-4">
        <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-700/60 bg-slate-950/75 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/55 sm:-mx-5 sm:mb-6 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-slate-800/50 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 touch-manipulation sm:min-h-0 sm:min-w-0 sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
            >
              <FaArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sm:hidden">Home</span>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                Scores
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block sm:text-sm">
                Charts, Wave 1 pods, draft points, scoring rules, and recent Commander games
              </p>
            </div>
          </div>
        </header>

        <section className={sectionClass} aria-labelledby="score-charts-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaTrophy className="h-7 w-7 text-amber-400" aria-hidden />
              <h2 id="score-charts-heading" className="text-2xl font-bold text-white md:text-3xl">
                Standings & charts
              </h2>
            </div>
            {leagues.length > 1 && currentLeague && (
              <select
                value={currentLeague.id}
                onChange={(e) => {
                  const league = leagues.find((l) => l.id === e.target.value);
                  if (league) setCurrentLeague(league);
                }}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                aria-label="Select league for charts"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-6">
            <LeagueStatus leagueId={currentLeague?.id} refreshInterval={60_000} />
          </div>
          <div className="mb-8">
            <LeagueFullScoresTable leagueId={currentLeague?.id ?? undefined} limit={100} />
          </div>
          <div className="space-y-8">
            <SimpleLeaderboardChart leagueId={currentLeague?.id ?? undefined} limit={100} />
            <div id="wave1-pods" className="scroll-mt-20">
              <Wave1PodResults leagueId={currentLeague?.id ?? undefined} />
            </div>
            <DraftPointsChart />
          </div>
        </section>

        <CommanderScoring />
      </div>
    </div>
  );
}
