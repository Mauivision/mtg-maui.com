import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { isStaticLeagueDataMode } from '@/lib/static-league-data';

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

    const [totalUsers, totalGames, totalLeagues, totalEvents, newsCount] = await Promise.all([
      prisma.user.count(),
      prisma.leagueGame.count(),
      prisma.league.count(),
      prisma.event.count(),
      prisma.news.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalLeagues,
      totalEvents,
      newsCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
