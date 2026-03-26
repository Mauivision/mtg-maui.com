'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaBook, FaDice, FaTrophy } from 'react-icons/fa';
import { useLeague } from '@/contexts/LeagueContext';
import { useCharacterSheets } from '@/hooks';
import { resolveCharacterIconForPlayer } from '@/lib/character-sheet-icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CharacterSheetsPage() {
  const { currentLeague, leagues, setCurrentLeague, loading: leagueLoading } = useLeague();
  const { players, loading, refresh } = useCharacterSheets(currentLeague?.id ?? null);

  const isLoading = loading || leagueLoading;

  const sorted = [...players].sort((a, b) => {
    const aa = a.active === false ? 1 : 0;
    const bb = b.active === false ? 1 : 0;
    if (aa !== bb) return aa - bb;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return (a.rank ?? 0) - (b.rank ?? 0);
  });

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
                Character Sheets
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block sm:text-sm">
                Icons, stats, and most recent Commander used (includes dropped members)
              </p>
            </div>

            {leagues.length > 1 && currentLeague && (
              <select
                value={currentLeague.id}
                onChange={(e) => {
                  const league = leagues.find((l) => l.id === e.target.value);
                  if (league) setCurrentLeague(league);
                }}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                aria-label="Select league"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-amber-400 text-amber-400 hover:bg-amber-900/30"
              onClick={() => void refresh()}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-2 py-12 sm:flex-row">
            <LoadingSpinner size="lg" className="text-amber-500" />
            <span className="text-center text-base text-slate-200 sm:text-left">
              Loading character sheets…
            </span>
          </div>
        ) : sorted.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center text-slate-400">
              No players found. Add players and games in{' '}
              <Link
                href="/wizards"
                className="text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300"
              >
                Wizards
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p) => {
              const icon = resolveCharacterIconForPlayer(p.playerName);
              return (
                <Card
                  key={p.id}
                  className="bg-slate-800/50 border-slate-700 transition-shadow hover:shadow-lg hover:shadow-amber-900/20"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Image
                            src={icon.url}
                            alt={`${p.playerName} character icon`}
                            className="h-8 w-8 rounded-full border border-amber-500/40 object-cover"
                            width={32}
                            height={32}
                            unoptimized
                          />
                          <CardTitle className="text-white text-lg truncate">{p.playerName}</CardTitle>
                        </div>
                        <div
                          className="flex items-center gap-2 text-amber-300 text-sm mt-1"
                          aria-label={`Commander: ${p.commander || 'Not specified'}`}
                        >
                          <FaBook className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{p.commander || '—'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className="bg-amber-900/50 text-amber-200">#{p.rank}</Badge>
                        {p.active === false && (
                          <Badge className="bg-slate-700 text-slate-200">Dropped</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400" title="Level equals commander games played">
                        Level
                      </span>
                      <span className="text-amber-400 font-semibold tabular-nums">{p.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points</span>
                      <span className="text-amber-400 font-semibold tabular-nums">{p.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Games played</span>
                      <span className="text-white tabular-nums">{p.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Record</span>
                      <span className="text-white tabular-nums">
                        {p.wins ?? 0}W–{p.losses ?? 0}L
                      </span>
                    </div>

                    {Array.isArray(p.achievements) && p.achievements.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/60">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wide">
                          <FaTrophy className="w-3.5 h-3.5 text-amber-400" aria-hidden />
                          Achievements
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.achievements.slice(0, 6).map((a) => (
                            <Badge key={a} className="bg-slate-700/60 text-slate-100">
                              {a}
                            </Badge>
                          ))}
                          {p.achievements.length > 6 && (
                            <Badge className="bg-slate-700/60 text-slate-300">
                              +{p.achievements.length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
                      <FaDice className="w-3.5 h-3.5" aria-hidden />
                      Commander shown is taken from the latest recorded Commander pod when available.
                    </div>
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

