import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { isStaticLeagueDataMode } from '@/lib/static-league-data';
import { logger } from '@/lib/logger';

/**
 * Public stats for home page "editable" charts.
 * Data is edited via Admin (players, games, events, news); this endpoint is read-only.
 * Uses static data when DATABASE_URL is not set.
 */
export async function GET() {
  try {
    if (isStaticLeagueDataMode()) {
      const { getStaticStats } = await import('@/lib/static-league-data');
      return NextResponse.json(getStaticStats());
    }

    const [totalUsers, totalGames, totalLeagues, totalDrafts, totalEvents, newsCount] = await Promise.all([
      prisma.user.count(),
      prisma.leagueGame.count(),
      prisma.league.count(),
      prisma.draftEvent.count(),
      prisma.event.count(),
      prisma.news.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalLeagues,
      totalDrafts,
      totalEvents,
      newsCount,
    });
  } catch (error) {
    logger.warn('Stats DB unavailable; using static league-data.json', {
      err: error instanceof Error ? error.message : String(error),
    });
    try {
      const { getStaticStats } = await import('@/lib/static-league-data');
      return NextResponse.json({ ...getStaticStats(), source: 'static-json' as const });
    } catch {
      // If even static loading fails, fall back to a stable shape.
      return NextResponse.json({
        totalUsers: 0,
        totalGames: 0,
        totalLeagues: 0,
        totalDrafts: 0,
        totalEvents: 0,
        newsCount: 0,
        source: 'empty-fallback' as const,
      });
    }
  }
}
