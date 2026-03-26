import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { aggregateLeaderboardFromDatabase } from '@/lib/leaderboard-db-aggregate';
import { isStaticLeagueDataMode, getStaticLeagueStatus } from '@/lib/static-league-data';

const querySchema = z.object({
  leagueId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = querySchema.safeParse({
      leagueId: searchParams.get('leagueId') || undefined,
    });

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { leagueId } = validated.data;

    if (isStaticLeagueDataMode()) {
      const data = getStaticLeagueStatus(leagueId);
      if (!data) return NextResponse.json({ error: 'No active league found' }, { status: 404 });
      return NextResponse.json(data);
    }

    try {
    const league = leagueId
      ? await prisma.league.findUnique({ where: { id: leagueId } })
      : await prisma.league.findFirst({ where: { status: 'active' } });

    if (!league) {
      return NextResponse.json({ error: 'No active league found' }, { status: 404 });
    }

    const totalPlayers = await prisma.leagueMembership.count({
      where: { leagueId: league.id, active: true },
    });

    const totalGames = await prisma.leagueGame.count({
      where: { leagueId: league.id },
    });

    const totalDrafts = await prisma.draftEvent.count().catch(() => 0);

    // Schema has no LeagueGame.status; treat all recorded games as completed
    const completedGames = totalGames;
    const activeGames = 0;
    const upcomingGames = 0;

    const recentGames = await prisma.leagueGame.findMany({
      where: { leagueId: league.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        gameDecks: {
          select: { playerId: true, placement: true, points: true },
        },
      },
    });

    const leaderboardRows = await aggregateLeaderboardFromDatabase({
      leagueId: league.id,
      gameType: 'all',
    });
    const topPlayers = leaderboardRows.slice(0, 3).map((r) => ({
      id: r.id,
      name: r.name,
      points: r.points,
    }));

    return NextResponse.json({
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        status: league.status,
        format: league.format,
        startDate: league.startDate?.toISOString(),
        endDate: league.endDate?.toISOString() ?? null,
      },
      stats: {
        totalPlayers,
        totalGames,
        totalDrafts,
        completedGames,
        activeGames,
        upcomingGames,
      },
      recentGames: recentGames.map((g) => ({
        id: g.id,
        gameType: g.gameType,
        date: g.date.toISOString(),
        participants: g.gameDecks.length,
      })),
      topPlayers,
    });
    } catch (dbErr) {
      logger.warn('League status DB unavailable; using static league-data.json', {
        err: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
      const data = getStaticLeagueStatus(leagueId);
      if (!data) return NextResponse.json({ error: 'No active league found' }, { status: 404 });
      return NextResponse.json({ ...data, source: 'static-json' as const });
    }
  } catch (error) {
    logger.error('League status API error', error);
    return handleApiError(error);
  }
}
