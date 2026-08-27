'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeagueHqShell } from '@/components/league-hq/LeagueHqShell';
import { StandingsTable } from '@/components/league-hq/StandingsTable';
import {
  getActiveLeague,
  loadLeagues,
  SEASON4_DISCLAIMER,
  setActiveLeagueId,
  standingsFromLeague,
  type LocalLeague,
  type StandingsRow,
} from '@/lib/league-hq';

export default function LeaderboardPage() {
  const [leagues, setLeagues] = useState<LocalLeague[]>([]);
  const [rows, setRows] = useState<StandingsRow[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const list = loadLeagues();
    const active = getActiveLeague();
    setLeagues(list);
    setActiveId(active.id);
    setRows(standingsFromLeague(active));
  }, []);

  const onLeagueChange = (id: string) => {
    setActiveId(id);
    setActiveLeagueId(id);
    const league = loadLeagues().find((l) => l.id === id);
    if (league) setRows(standingsFromLeague(league));
  };

  return (
    <LeagueHqShell
      badge="Season 4 · Standings"
      title="Leaderboard"
      subtitle="Commander points + draft points = total league score."
    >
      {leagues.length > 1 && (
        <div className="mb-6">
          <label htmlFor="league-select" className="mb-1 block text-xs text-slate-400">
            League
          </label>
          <select
            id="league-select"
            value={activeId}
            onChange={(e) => onLeagueChange(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <StandingsTable rows={rows} disclaimer={SEASON4_DISCLAIMER} />

      <p className="mt-8 text-center text-sm text-slate-500">
        Run your own league on{' '}
        <Link href="/leagues" className="text-amber-400 hover:text-amber-300">
          Leagues
        </Link>
        . Season 3 historical charts remain on{' '}
        <Link href="/score" className="text-amber-400 hover:text-amber-300">
          Scores (archive)
        </Link>
        .
      </p>
    </LeagueHqShell>
  );
}
