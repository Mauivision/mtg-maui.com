'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaArrowLeft, FaRedo, FaTable } from 'react-icons/fa';
import { resolveCharacterIconForPlayer } from '@/lib/character-sheet-icons';

type Breakdown = {
  win?: number;
  elims?: number;
  headsUp?: number;
  golden?: number;
  silver?: number;
  inGameVp?: number;
};

type CommanderGameRow = {
  id: string;
  name: string;
  createdAt: string;
  notes?: string | null;
  players: Array<{
    id: string;
    name: string;
    commander: string;
    placement: number;
    points: number;
    knockouts: number;
    goldAchievements?: number;
    silverAchievements?: number;
    breakdown?: Breakdown;
  }>;
};

function n(v: unknown): number | null {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

export default function GamesPage() {
  const [games, setGames] = useState<CommanderGameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/commander/games?limit=100', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load games');
      setGames(data.games || []);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  const sorted = useMemo(() => {
    return [...games].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [games]);

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
              <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">Games</h1>
              <p className="hidden text-xs text-slate-400 sm:block sm:text-sm">
                Per-pod tables with dynamic breakdown columns when available
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && <span className="text-xs text-slate-500">Updated {lastUpdate.toLocaleTimeString()}</span>}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void fetchGames()}
                className="border-amber-400/80 text-amber-300 hover:bg-amber-950/40"
              >
                <FaRedo className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-14">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <Card className="border-red-500/30 bg-slate-900/40">
            <CardContent className="p-6 text-center text-red-200">{error}</CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sorted.map((g) => {
              const players = [...(g.players || [])].sort((a, b) => a.placement - b.placement);
              return (
                <Card key={g.id} className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <FaTable className="h-4 w-4 text-amber-400" aria-hidden />
                      <span className="truncate">{g.name}</span>
                      <span className="ml-auto text-xs font-normal text-slate-400">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </CardTitle>
                    {g.notes && <p className="mt-2 text-sm text-slate-400">{g.notes}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-slate-700/70 bg-slate-950/40">
                      <table className="w-full min-w-[980px] border-collapse text-sm" aria-label="Commander pod table">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-900/60">
                            <th className="px-3 py-2.5 text-left font-semibold text-slate-300">Player</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">Win (5)</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">Elims</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">Heads-up</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">Golden</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">Silver</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-slate-300">In-game VP</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-amber-200/95">Total VP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((p) => {
                            const b = p.breakdown;
                            const win = n(b?.win);
                            const elims = n(b?.elims) ?? n(p.knockouts);
                            const headsUp = n(b?.headsUp);
                            const golden = n(b?.golden) ?? n(p.goldAchievements);
                            const silver = n(b?.silver) ?? n(p.silverAchievements);
                            const inGameVp = n(b?.inGameVp);
                            const icon = resolveCharacterIconForPlayer(p.name);
                            return (
                              <tr key={p.id} className="border-b border-slate-800/70">
                                <td className="px-3 py-2 text-slate-100">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <Image
                                        src={icon.url}
                                        alt=""
                                        width={28}
                                        height={28}
                                        className="h-7 w-7 shrink-0 rounded-full border border-amber-500/35 object-cover object-[center_25%]"
                                        sizes="28px"
                                      />
                                      <span className="font-medium">{p.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{p.commander || '—'}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{win ?? '—'}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{elims ?? '—'}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{headsUp ?? '—'}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{golden ?? '—'}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{silver ?? '—'}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-slate-200">{inGameVp ?? '—'}</td>
                                <td className="px-3 py-2 text-center text-base font-semibold tabular-nums text-amber-300">
                                  {p.points}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      If a column shows <span className="font-semibold">—</span>, that breakdown wasn’t stored for that pod yet
                      (only total VP is required).
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

