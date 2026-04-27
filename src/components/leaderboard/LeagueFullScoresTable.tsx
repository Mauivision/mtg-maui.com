'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaRedo, FaTable } from 'react-icons/fa';
import type { RealtimeLeaderboardEntry } from '@/types/leaderboard';
import { resolveCharacterIconForPlayer } from '@/lib/character-sheet-icons';

const POLL_MS = 90_000;

interface LeagueFullScoresTableProps {
  leagueId?: string;
  /** Max rows (API allows up to 100). */
  limit?: number;
}

export const LeagueFullScoresTable: React.FC<LeagueFullScoresTableProps> = ({
  leagueId,
  limit = 100,
}) => {
  const [entries, setEntries] = useState<RealtimeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        gameType: 'all',
        limit: String(limit),
        ...(leagueId && { leagueId }),
      });
      const res = await fetch(`/api/leaderboard/realtime?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load standings');
      setEntries(data.entries || []);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  }, [leagueId, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => void load(), POLL_MS);
    const onVis = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  return (
    <Card className="border-amber-500/25 bg-slate-800/50 ring-1 ring-amber-500/15">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <FaTable className="mt-1 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
            <div>
              <h3 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                Full league scores (updated)
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Commander pod VP plus both drafts (with bonuses). If the database is offline, the site automatically uses
                the corrected <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">league-data.json</code>{' '}
                so totals stay in sync with the latest pod and draft scores.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
            {lastUpdate && (
              <span className="text-xs text-slate-500">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load()}
              className="border-amber-400/80 text-amber-300 hover:bg-amber-950/40"
            >
              <FaRedo className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && entries.length === 0 ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : error && entries.length === 0 ? (
          <p className="py-6 text-center text-red-300/90" role="alert">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-600/80 bg-slate-950/40">
            <table className="w-full min-w-[800px] border-collapse text-sm" aria-label="Full league scores">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-900/60">
                  <th scope="col" className="px-3 py-2.5 text-left font-semibold text-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left font-semibold text-slate-300">
                    Player
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold text-slate-300">
                    <span>Cmd VP</span>
                    <span className="mt-0.5 block text-[10px] font-normal text-slate-500">Rounds 1–5 + 6+</span>
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold text-slate-300">
                    <span>Draft VP</span>
                    <span className="mt-0.5 block text-[10px] font-normal text-slate-500">Draft 1 + 2</span>
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold text-amber-200/95">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left font-semibold text-slate-400">
                    Draft notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-700/70 odd:bg-slate-900/35 even:bg-slate-900/20"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-slate-400 tabular-nums">{e.rank}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={resolveCharacterIconForPlayer(e.name).url}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded-full border border-amber-500/35 object-cover"
                        />
                        <span className="font-medium text-slate-100">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-200">
                      <span className="block">{typeof e.commanderPoints === 'number' ? e.commanderPoints : '—'}</span>
                      {typeof e.commanderGame1Points === 'number' &&
                        typeof e.commanderGame2Points === 'number' && (
                          <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                            {e.commanderGame1Points}+{e.commanderGame2Points}
                          </span>
                        )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-200">
                      <span className="block">{typeof e.draftPoints === 'number' ? e.draftPoints : '—'}</span>
                      {typeof e.draftLeaguePoints1 === 'number' &&
                        typeof e.draftLeaguePoints2 === 'number' && (
                          <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                            {e.draftLeaguePoints1}+{e.draftLeaguePoints2}
                          </span>
                        )}
                    </td>
                    <td className="px-3 py-2 text-right text-base font-semibold tabular-nums text-amber-300">
                      <span className="block">{e.points}</span>
                      {typeof e.commanderGame1Points === 'number' &&
                        typeof e.commanderGame2Points === 'number' &&
                        typeof e.draftLeaguePoints1 === 'number' &&
                        typeof e.draftLeaguePoints2 === 'number' && (
                          <span
                            className="mt-0.5 block text-[10px] font-normal text-slate-500"
                            title="Cmd (early+late) + Draft1 + Draft2"
                          >
                            {e.commanderGame1Points}+{e.commanderGame2Points}+{e.draftLeaguePoints1}+
                            {e.draftLeaguePoints2}
                          </span>
                        )}
                    </td>
                    <td className="max-w-[280px] px-3 py-2 text-xs leading-snug text-slate-500">
                      {e.draftDetail && <span title={e.draftDetail}>{e.draftDetail}</span>}
                      {!e.draftDetail &&
                        typeof e.firstDraftPointsPlayedForDan === 'number' &&
                        e.firstDraftPointsPlayedForDan > 0 && (
                          <span title="First draft played for another player">
                            First-draft (for Dan): {e.firstDraftPointsPlayedForDan} (not in total)
                          </span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && entries.length > 0 && (
          <p className="mt-3 text-center text-xs text-amber-600/90">Refresh warning: {error}</p>
        )}
      </CardContent>
    </Card>
  );
};
