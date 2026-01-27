import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';

/**
 * Public stats for home page "editable" charts.
 * Data is edited via Admin (players, games, events, news); this endpoint is read-only.
 */
export async function GET() {
  try {
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
