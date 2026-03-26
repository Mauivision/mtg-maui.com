'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaCrown, FaSkull, FaUsers, FaTrophy, FaCalculator, FaHeart, FaListUl, FaChartBar } from 'react-icons/fa';
import { format } from 'date-fns';

interface CommanderGame {
  id: string;
  name: string;
  /** Pod or match notes from the league (e.g. how the winner won). */
  notes?: string | null;
  players: Array<{
    id: string;
    name: string;
    commander: string;
    placement: number;
    points: number;
    knockouts: number;
    /** When present, used for rule breakdown (optional in API). */
    goldAchievements?: number;
    silverAchievements?: number;
    eliminatedBy?: string;
    lifeRemaining?: number;
  }>;
  winner: {
    id: string;
    name: string;
    commander: string;
  };
  totalPlayers: number;
  createdAt: string;
}

interface ScoringBreakdown {
  goldPoints: number;
  silverPoints: number;
  knockoutPoints: number;
  finalWinnerPoints: number;
  secondPlacePoints: number;
  totalPoints: number;
}

type MobileTab = 'games' | 'details';

export const CommanderScoring: React.FC = () => {
  const [games, setGames] = useState<CommanderGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<CommanderGame | null>(null);
  const [showScoringBreakdown, setShowScoringBreakdown] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('games');
  const detailsAnchorRef = useRef<HTMLDivElement>(null);

  const isLg = useCallback(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches, []);

  useEffect(() => {
    fetchCommanderGames();
  }, []);

  const selectGame = (game: CommanderGame) => {
    setSelectedGame(game);
    if (!isLg()) {
      setMobileTab('details');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          detailsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  };

  const fetchCommanderGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commander/games');
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch Commander games:', error);
    } finally {
      setLoading(false);
    }
  };

  /** League rules (see “How points work” on this page). Gold/silver default to 0 when not in game data. */
  const calculateScoring = (
    placement: number,
    knockouts: number,
    goldAchievements = 0,
    silverAchievements = 0
  ): ScoringBreakdown => {
    const goldPoints = goldAchievements * 5;
    const silverPoints = silverAchievements * 1;
    const knockoutPoints = knockouts * 1;
    const finalWinnerPoints = placement === 1 ? 5 : 0;
    const secondPlacePoints = placement === 2 ? 1 : 0;
    const totalPoints =
      goldPoints + silverPoints + knockoutPoints + finalWinnerPoints + secondPlacePoints;

    return {
      goldPoints,
      silverPoints,
      knockoutPoints,
      finalWinnerPoints,
      secondPlacePoints,
      totalPoints,
    };
  };

  const getPlacementColor = (placement: number) => {
    switch (placement) {
      case 1:
        return 'text-amber-100 bg-amber-500/15 border-amber-500/35';
      case 2:
        return 'text-slate-200 bg-slate-500/15 border-slate-500/35';
      case 3:
        return 'text-orange-200 bg-orange-600/15 border-orange-500/30';
      default:
        return 'text-slate-300 bg-slate-800/60 border-slate-600/50';
    }
  };

  const getPlacementIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <FaCrown className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />;
      case 2:
        return <FaTrophy className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />;
      case 3:
        return <FaTrophy className="h-4 w-4 shrink-0 text-orange-400" aria-hidden />;
      default:
        return <FaUsers className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-2 py-12 sm:flex-row">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="text-center text-base text-slate-200 sm:text-left">Loading Commander games…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-1">
        <h2 className="text-balance bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl">
          League scoring
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
          Commander pods use gold/silver achievements, eliminations, and finish bonuses. Draft uses match wins only
          — see below.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-700/80 bg-slate-900/40 shadow-xl shadow-black/20 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-700/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-white sm:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <FaCalculator className="h-4 w-4" aria-hidden />
            </span>
            How points work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-5">
          <section aria-labelledby="commander-scoring-rules">
            <h3 id="commander-scoring-rules" className="text-base font-semibold text-white sm:text-lg">
              Commander games
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Each player’s <strong className="text-slate-100">game score</strong> is the sum of everything they earned
              in that pod: achievements, eliminations, and where they finished. Those pieces are recorded on the score
              sheet; the list below shows each player’s <strong className="text-slate-100">official league points</strong>{' '}
              when the league has stored totals, or a <strong className="text-slate-100">rule-based total</strong> built
              from the same categories.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-amber-400">5</span>
                <span>points for each <strong className="text-slate-100">Gold</strong> achievement</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-amber-400">1</span>
                <span>point for each <strong className="text-slate-100">Silver</strong> achievement</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-amber-400">1</span>
                <span>point per <strong className="text-slate-100">knockout</strong> (each elimination you’re credited with)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-amber-400">5</span>
                <span>points for <strong className="text-slate-100">1st place</strong> (pod winner)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-amber-400">1</span>
                <span>point for <strong className="text-slate-100">2nd place</strong></span>
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-slate-600/40 bg-slate-800/30 p-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              <p className="font-medium text-slate-200">Who won?</p>
              <p className="mt-2">
                The <strong className="text-slate-100">pod winner</strong> is the player in{' '}
                <strong className="text-slate-100">1st place</strong> when the game ends (last standing or per your
                table’s agreed tiebreakers). They earn the +5 winner bonus and appear with the crown in recent games and
                in the breakdown. 2nd place gets +1; other placements do not get a placement bonus from these rules.
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-slate-600/40 bg-slate-800/30 p-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              <p className="font-medium text-slate-200">How the math can look</p>
              <p className="mt-2">
                Example: <span className="tabular-nums text-slate-200">1</span> Gold,{' '}
                <span className="tabular-nums text-slate-200">2</span> Silvers,{' '}
                <span className="tabular-nums text-slate-200">2</span> KOs, finish{' '}
                <strong className="text-slate-100">1st</strong> →{' '}
                <span className="tabular-nums text-amber-300/95">
                  5 + 2 + 2 + 5 = 14
                </span>{' '}
                points before any league adjustments. Tap <strong className="text-slate-100">Show point breakdown</strong>{' '}
                on a game to see Gold, Silver, KOs, and placement lines for each player when we have that detail.
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              If the league saved <strong className="text-slate-300">pod notes</strong> for a game (for example how the
              winner closed it out), those appear under the winner in the game breakdown on the right.
            </p>
          </section>
          <section aria-labelledby="draft-scoring-rules" className="border-t border-slate-700/50 pt-6">
            <h3 id="draft-scoring-rules" className="text-base font-semibold text-white sm:text-lg">
              Draft games
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <span className="font-bold tabular-nums text-violet-400">1</span> league point (draft VP) for each draft{' '}
              <strong className="text-slate-100">match</strong> you win in the 1v1 bracket (each match win in the
              recorded standings). Your draft total is the sum of those points across the drafts that count for the
              season.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <strong className="text-slate-100">Undefeated bonus:</strong> if you finish the draft with{' '}
              <strong className="text-slate-100">6</strong> match wins (a full sweep in the usual four-round structure),
              add <strong className="text-slate-100">+1</strong> bonus VP on top of those six. That bonus is included in
              the leaderboard draft column and in any “6+1” breakdown lines.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <strong className="text-slate-100">Who won</strong> a draft is whoever finishes highest in that event’s
              standings (most match wins, then any tiebreakers the TO used). That is separate from Commander pods; both
              feed the combined leaderboard when your league tracks both.
            </p>
          </section>
        </CardContent>
      </Card>

      <div
        className="flex gap-2 rounded-xl border border-slate-700/60 bg-slate-900/50 p-1 lg:hidden"
        role="tablist"
        aria-label="Score keeper sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'games'}
          className={`min-h-11 flex-1 touch-manipulation rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'games'
              ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40'
              : 'text-slate-400 active:bg-slate-800'
          }`}
          onClick={() => setMobileTab('games')}
        >
          <span className="flex items-center justify-center gap-2">
            <FaListUl className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            Games
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'details'}
          className={`min-h-11 flex-1 touch-manipulation rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'details'
              ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40'
              : 'text-slate-400 active:bg-slate-800'
          }`}
          onClick={() => setMobileTab('details')}
        >
          <span className="flex items-center justify-center gap-2">
            <FaChartBar className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            Details
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={`${mobileTab === 'games' ? 'block' : 'hidden'} lg:block`}>
          <Card className="h-full border-slate-700/80 bg-slate-900/40 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700/50 pb-3">
              <CardTitle className="text-lg text-white sm:text-xl">Recent games</CardTitle>
              <p className="text-xs font-normal text-slate-500 sm:text-sm">Tap a row to open scoring</p>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="max-h-[min(24rem,55vh)] space-y-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-96">
                {games.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-600 py-10 text-center text-slate-500">
                    No Commander games yet
                  </li>
                ) : (
                  games.map((game) => {
                    const active = selectedGame?.id === game.id;
                    return (
                      <li key={game.id}>
                        <button
                          type="button"
                          onClick={() => selectGame(game)}
                          className={`w-full touch-manipulation rounded-xl border p-3.5 text-left transition-colors active:scale-[0.99] sm:p-4 md:hover:border-amber-500/40 ${
                            active
                              ? 'border-amber-500/50 bg-amber-950/25 ring-1 ring-amber-500/30'
                              : 'border-slate-600/60 bg-slate-800/30 active:bg-slate-800/60 md:hover:bg-slate-800/45'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                            <h3 className="min-w-0 flex-1 font-medium leading-snug text-white">{game.name}</h3>
                            <time
                              className="shrink-0 text-xs tabular-nums text-slate-500 sm:text-sm"
                              dateTime={game.createdAt}
                            >
                              {format(new Date(game.createdAt), 'MMM d')}
                            </time>
                          </div>
                          <div className="mt-2 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                              <FaCrown className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
                              <span className="truncate font-medium text-slate-200">{game.winner.name}</span>
                              <span className="truncate text-slate-500">({game.winner.commander})</span>
                            </div>
                            <span className="shrink-0 text-xs text-slate-500 sm:text-sm">
                              {game.totalPlayers} players
                            </span>
                          </div>
                          {game.notes?.trim() && (
                            <p className="mt-2 text-left text-xs leading-snug text-amber-200/80 sm:text-sm">
                              Pod notes: how they won is recorded — open for details.
                            </p>
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div
          ref={detailsAnchorRef}
          id="commander-score-details"
          className={`scroll-mt-24 ${mobileTab === 'details' ? 'block' : 'hidden'} lg:block`}
        >
          <Card className="h-full border-slate-700/80 bg-slate-900/40 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700/50 pb-3">
              <CardTitle className="text-lg text-white sm:text-xl">
                {selectedGame ? 'Game breakdown' : 'Pick a game'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {selectedGame ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-600/50 bg-slate-800/40 p-4 text-center sm:p-5">
                    <h3 className="text-balance text-lg font-bold text-white sm:text-xl">{selectedGame.name}</h3>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <FaCrown className="h-5 w-5 text-amber-400" aria-hidden />
                      <span className="font-semibold text-amber-200">{selectedGame.winner.name}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Commander:{' '}
                      <span className="text-slate-300">{selectedGame.winner.commander}</span>
                    </p>
                    {selectedGame.notes?.trim() && (
                      <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-3 text-left text-sm leading-relaxed text-slate-200 sm:px-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/90">
                          How they won (pod notes)
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap text-pretty">{selectedGame.notes.trim()}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Final standings
                    </h4>
                    <ul className="space-y-3">
                      {selectedGame.players
                        .slice()
                        .sort((a, b) => a.placement - b.placement)
                        .map((player) => {
                          const scoring = calculateScoring(
                            player.placement,
                            player.knockouts,
                            player.goldAchievements ?? 0,
                            player.silverAchievements ?? 0
                          );
                          const useStoredPoints = typeof player.points === 'number';
                          return (
                            <li
                              key={player.id}
                              className={`rounded-xl border p-3.5 sm:p-4 ${getPlacementColor(player.placement)}`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-2.5">
                                  {getPlacementIcon(player.placement)}
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                      <span className="font-semibold text-white">{player.name}</span>
                                      <span className="text-xs tabular-nums text-slate-400">#{player.placement}</span>
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-slate-400">{player.commander}</p>
                                  </div>
                                </div>
                                <div className="shrink-0 text-left sm:text-right">
                                  <div className="text-xl font-bold tabular-nums text-white sm:text-2xl">
                                    {useStoredPoints ? `${player.points} pts` : `${scoring.totalPoints} pts`}
                                  </div>
                                  {useStoredPoints && (
                                    <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                                      League-recorded total
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-600/30 pt-3 text-sm text-slate-300">
                                <span className="inline-flex items-center gap-1.5">
                                  <FaSkull className="h-3.5 w-3.5 text-rose-400/90" aria-hidden />
                                  {player.knockouts} KO
                                  {player.knockouts === 1 ? '' : 's'}
                                </span>
                                {player.lifeRemaining != null && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <FaHeart className="h-3.5 w-3.5 text-rose-400/80" aria-hidden />
                                    {player.lifeRemaining} life
                                  </span>
                                )}
                              </div>

                              {showScoringBreakdown && (
                                <div className="mt-3 border-t border-slate-600/40 pt-3">
                                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-3 lg:grid-cols-5">
                                    <div>
                                      Gold <span className="text-slate-300">+{scoring.goldPoints}</span>
                                    </div>
                                    <div>
                                      Silver <span className="text-slate-300">+{scoring.silverPoints}</span>
                                    </div>
                                    <div>
                                      KOs <span className="text-slate-300">+{scoring.knockoutPoints}</span>
                                    </div>
                                    <div>
                                      Winner <span className="text-slate-300">+{scoring.finalWinnerPoints}</span>
                                    </div>
                                    <div>
                                      2nd <span className="text-slate-300">+{scoring.secondPlacePoints}</span>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-[11px] leading-snug text-slate-500">
                                    Rule subtotal: {scoring.totalPoints} pts
                                    {useStoredPoints &&
                                      ` · Official total above may include adjustments or data not shown here.`}
                                  </p>
                                </div>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowScoringBreakdown(!showScoringBreakdown)}
                    className="min-h-11 w-full touch-manipulation border-amber-500/50 text-amber-300 hover:bg-amber-950/30"
                  >
                    {showScoringBreakdown ? 'Hide' : 'Show'} point breakdown
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-600">
                    <FaTrophy className="h-8 w-8" aria-hidden />
                  </div>
                  <p className="max-w-xs text-center text-sm text-slate-500 sm:text-base">
                    Choose a game from the list to see placements and calculated points.
                  </p>
                  <button
                    type="button"
                    className="mt-6 min-h-11 touch-manipulation text-sm font-medium text-amber-400 underline-offset-4 hover:text-amber-300 hover:underline lg:hidden"
                    onClick={() => setMobileTab('games')}
                  >
                    Go to games
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
