'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaTrophy, FaUsers, FaCalendar, FaDice, FaNewspaper, FaBook } from 'react-icons/fa';
import { useLeague } from '@/contexts/LeagueContext';
import { useHomeData, useCharacterSheets } from '@/hooks';
import { SimpleLeaderboardChart } from '@/components/leaderboard/SimpleLeaderboardChart';
import { DraftPointsChart } from '@/components/leaderboard/DraftPointsChart';
import { RealtimeLeaderboard } from '@/components/leaderboard/RealtimeLeaderboard';
import { Wave1PodResults } from '@/components/leaderboard/Wave1PodResults';
import { LeagueStatus } from '@/components/league/LeagueStatus';
import { siteImages } from '@/lib/site-images';
import {
  HOME_FEATURED_COMMANDER_PODS_ITEM,
  HOME_FEATURED_NEWS_ITEM,
  HOME_HERO_DRAFT_COUNT,
  HOME_LEADERBOARD_COMMANDER_NOTE,
} from '@/lib/home-page';
import { resolveCharacterIconForPlayer } from '@/lib/character-sheet-icons';

const sectionClass = 'scroll-mt-20 py-16 md:py-24 border-b border-slate-800/60';

export default function HomePage() {
  const { currentLeague, leagues, setCurrentLeague, loading: leagueLoading } = useLeague();
  const { stats, news, events, loading: loadingNews } = useHomeData();
  const { players, loading: loadingChars } = useCharacterSheets(currentLeague?.id ?? null);
  const charsLoading = loadingChars || leagueLoading;
  const activePlayers = players.filter((p) => p.active !== false);

  return (
    <div className="min-h-screen">
      {/* Hero — castle sky over global background */}
      <section id="hero" className={`${sectionClass} relative overflow-hidden`} aria-label="Hero">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 md:opacity-55"
          style={{ backgroundImage: `url(${siteImages.backgrounds.home})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/45 to-slate-950/88"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400/90 text-sm uppercase tracking-widest mb-3">Season 4 · Chaos Commander</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            MTG Maui League
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
            Season 3 is in the books. Season 4 is casual Chaos Commander plus chaos-pack or pick-2 drafts.
            The{' '}
            <Link href="/decks" className="text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300">
              deck helper
            </Link>{' '}
            builds lists from cards you own (auto-picks Storm, Windrider when she&apos;s in your pool). Standings and
            character stats here; charts on{' '}
            <Link href="/score" className="text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300">
              Scores
            </Link>
            .
          </p>
          <Link
            href="/decks"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:border-amber-400/60 hover:bg-amber-500/20 hover:text-amber-100 mb-10"
          >
            <FaBook className="h-4 w-4" aria-hidden />
            Deck builder — from your collection
          </Link>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-xl mx-auto mt-10">
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-sky-600/20 border border-sky-500/40 flex items-center justify-center transition-colors group-hover:border-sky-400/60 group-hover:bg-sky-600/30" aria-hidden>
                <FaUsers className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-xl font-bold text-white mt-2">{stats.totalUsers}</div>
              <div className="text-xs text-slate-400 uppercase">Players</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center transition-colors group-hover:border-amber-400/60 group-hover:bg-amber-600/30" aria-hidden>
                <FaTrophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white mt-2">{stats.totalLeagues}</div>
              <div className="text-xs text-slate-400 uppercase">Leagues</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center transition-colors group-hover:border-emerald-400/60 group-hover:bg-emerald-600/30" aria-hidden>
                <FaCalendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white mt-2">{stats.totalGames}</div>
              <div className="text-xs text-slate-400 uppercase">Games</div>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center transition-colors group-hover:border-violet-400/60 group-hover:bg-violet-600/30" aria-hidden>
                <FaDice className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-xl font-bold text-white mt-2">{stats.totalDrafts}</div>
              <div className="text-xs text-slate-400 uppercase">Drafts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className={sectionClass} aria-labelledby="leaderboard-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaTrophy className="w-7 h-7 text-amber-400" aria-hidden />
              <h2 id="leaderboard-heading" className="text-2xl md:text-3xl font-bold text-white">Leaderboard</h2>
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
          </div>
          <div className="mb-6">
            <LeagueStatus leagueId={currentLeague?.id} refreshInterval={60_000} />
          </div>
          <div className="space-y-6">
            <Wave1PodResults leagueId={currentLeague?.id} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <SimpleLeaderboardChart
                leagueId={currentLeague?.id ?? undefined}
                limit={24}
                metric="total"
              />
              <DraftPointsChart />
            </div>
            <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border border-slate-700 bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h3 className="text-lg font-semibold text-white">Combined total leaderboard</h3>
                <span className="text-xs text-slate-400">Commander + Draft = Total</span>
              </div>
              <RealtimeLeaderboard
                leagueId={currentLeague?.id ?? undefined}
                gameType="all"
                limit={10}
                variant="embed"
              />
            </div>
            <p className="text-center text-sm text-slate-400">
              <Link
                href="/score"
                className="font-medium text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300"
              >
                Scores
              </Link>
              {' '}
              — full totals chart, Wave 1 pods, scoring rules, and recent Commander games. See{' '}
              <Link
                href="/games"
                className="font-medium text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300"
              >
                Games
              </Link>{' '}
              for per-pod tables.
            </p>
          </div>
        </div>
      </section>

      {/* Character Charts */}
      <section id="character-charts" className={sectionClass} aria-labelledby="character-charts-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <FaDice className="w-7 h-7 text-amber-400" aria-hidden />
            <h2 id="character-charts-heading" className="text-2xl md:text-3xl font-bold text-white">Character Charts</h2>
          </div>
          {charsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !currentLeague ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                {leagues.length > 0
                  ? 'Select a league above to view character charts.'
                  : 'No league yet. Seed the database (npm run setup:maui) to see character charts.'}
              </CardContent>
            </Card>
          ) : players.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                No players. Add players and record games to see character charts.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePlayers.slice(0, 17).map((p) => {
                const icon = resolveCharacterIconForPlayer(p.playerName);
                return (
                <Card key={p.id} className="bg-slate-800/50 border-slate-700 transition-shadow hover:shadow-lg hover:shadow-amber-900/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Image
                            src={icon.url}
                            alt={`${p.playerName} character icon`}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full border border-amber-500/40 object-cover"
                          />
                          <CardTitle className="text-white text-lg">{p.playerName}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-amber-300 text-sm mt-1" aria-label={`Commander: ${p.commander || 'Not specified'}`}>
                          <FaBook className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          <span>{p.commander || '—'}</span>
                        </div>
                      </div>
                      <Badge className="bg-amber-900/50 text-amber-200 shrink-0">#{p.rank}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400" title="Level equals commander games played">
                        Level
                      </span>
                      <span className="text-amber-400 font-semibold tabular-nums" aria-label={`Level ${p.level}, one per game played`}>
                        {p.level}
                      </span>
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
                      <span className="text-slate-400">Win rate</span>
                      <span className="text-white">
                        {p.gamesPlayed > 0 && typeof p.wins === 'number'
                          ? ((p.wins / p.gamesPlayed) * 100).toFixed(1)
                          : '0'}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* News Feed */}
      <section id="news-feed" className={sectionClass} aria-labelledby="news-feed-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <FaNewspaper className="w-7 h-7 text-amber-400" aria-hidden />
            <h2 id="news-feed-heading" className="text-2xl md:text-3xl font-bold text-white">News Feed</h2>
          </div>
          {loadingNews ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {events.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Events</h3>
                  <div className="space-y-2">
                    {events.slice(0, 5).map((ev) => (
                      <Card key={ev.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-3 px-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-white">{ev.title}</span>
                          <span className="text-slate-400 text-sm">
                            {ev.date && new Date(ev.date).toLocaleDateString()}
                            {ev.location ? ` · ${ev.location}` : ''}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {news.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">News</h3>
                  <div className="space-y-2">
                    {news.slice(0, 10).map((n) => (
                      <Card key={n.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-3 px-4">
                          <div className="font-medium text-white">{n.title}</div>
                          {n.excerpt && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{n.excerpt}</p>}
                          <p className="text-slate-500 text-xs mt-2">
                            {n.category} · {new Date(n.publishedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {!loadingNews && events.length === 0 && news.length === 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-8 text-center text-slate-400">
                    No events or news yet. Add them via Wizards (Edit).
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
