import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

const querySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  playerId: z.string().optional(),
  leagueId: z.string().optional(),
});

function getStartDate(timeRange: string): Date {
  const now = new Date();
  const start = new Date(now);
  switch (timeRange) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  return start;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      timeRange: searchParams.get('timeRange') ?? '30d',
      playerId: searchParams.get('playerId') ?? undefined,
      leagueId: searchParams.get('leagueId') ?? undefined,
    });
    const { timeRange, leagueId } = parsed.success ? parsed.data : { timeRange: '30d' as const, leagueId: undefined };

    const startDate = getStartDate(timeRange);

    const baseWhere = {
      createdAt: { gte: startDate } as const,
      ...(leagueId && { leagueId }),
    };

    const [totalPlayers, totalTournaments, totalGames] = await Promise.all([
      prisma.user.count({
        where: leagueId ? { leagueMembers: { some: { leagueId } } } : {},
      }),
      prisma.league.count({
        where: leagueId ? { id: leagueId } : {},
      }),
      prisma.leagueGame.count({ where: baseWhere }),
    ]);

    const leagueFilter = leagueId
      ? Prisma.sql`AND lg.leagueId = ${leagueId}`
      : Prisma.empty;
    const leagueFilterSub = leagueId
      ? Prisma.sql`AND leagueId = ${leagueId}`
      : Prisma.empty;
    const userFilter = leagueId
      ? Prisma.sql`WHERE u.id IN (SELECT userId FROM LeagueMembership WHERE leagueId = ${leagueId})`
      : Prisma.empty;

    const tournamentHistory = await prisma.$queryRaw<
      Array<{ date: string; tournaments: number; participants: number }>
    >(
      Prisma.sql`
        SELECT
          date(lg.createdAt) as date,
          COUNT(DISTINCT lg.id) as tournaments,
          COUNT(DISTINCT lgd.playerId) as participants
        FROM LeagueGame lg
        LEFT JOIN LeagueGameDeck lgd ON lg.id = lgd.gameId
        WHERE lg.createdAt >= ${startDate}
        ${leagueFilter}
        GROUP BY date(lg.createdAt)
        ORDER BY date(lg.createdAt)
        LIMIT 30
      `
    );

    const gameTypeDistribution = await prisma.leagueGame.groupBy({
      by: ['gameType'],
      where: baseWhere,
      _count: { id: true },
    });

    const gameTypes = { commander: 0, draft: 0, standard: 0, other: 0 };
    gameTypeDistribution.forEach((item) => {
      const t = (item.gameType?.toLowerCase() || 'other') as keyof typeof gameTypes;
      if (t in gameTypes) (gameTypes[t] as number) = item._count.id;
      else gameTypes.other += item._count.id;
    });

    const topPlayers = await prisma.$queryRaw<
      Array<{ id: string; name: string | null; wins: number; losses: number; winRate: number; points: number }>
    >(
      Prisma.sql`
        SELECT
          u.id,
          u.name,
          COALESCE(wins.wins, 0) as wins,
          COALESCE(losses.losses, 0) as losses,
          CASE
            WHEN (COALESCE(wins.wins, 0) + COALESCE(losses.losses, 0)) > 0
            THEN ROUND((COALESCE(wins.wins, 0) * 100.0) / (COALESCE(wins.wins, 0) + COALESCE(losses.losses, 0)), 1)
            ELSE 0
          END as winRate,
          COALESCE(points.totalPoints, 0) as points
        FROM User u
        LEFT JOIN (
          SELECT playerId, COUNT(*) as wins
          FROM LeagueGameDeck
          WHERE placement = 1 AND gameId IN (
            SELECT id FROM LeagueGame WHERE createdAt >= ${startDate}
            ${leagueFilterSub}
          )
          GROUP BY playerId
        ) wins ON u.id = wins.playerId
        LEFT JOIN (
          SELECT playerId, COUNT(*) as losses
          FROM LeagueGameDeck
          WHERE placement > 1 AND gameId IN (
            SELECT id FROM LeagueGame WHERE createdAt >= ${startDate}
            ${leagueFilterSub}
          )
          GROUP BY playerId
        ) losses ON u.id = losses.playerId
        LEFT JOIN (
          SELECT playerId, SUM(points) as totalPoints
          FROM LeagueGameDeck
          WHERE gameId IN (
            SELECT id FROM LeagueGame WHERE createdAt >= ${startDate}
            ${leagueFilterSub}
          )
          GROUP BY playerId
        ) points ON u.id = points.playerId
        ${userFilter}
        ORDER BY winRate DESC, points DESC
        LIMIT 10
      `
    );

    const totalWins = topPlayers.reduce((s, p) => s + Number(p.wins), 0);
    const totalGamesPlayed = topPlayers.reduce(
      (s, p) => s + Number(p.wins) + Number(p.losses),
      0
    );
    const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;

    const performanceMetrics = await prisma.$queryRaw<
      Array<{ avgPointsPerGame: number; lastTwoStandingRate: number }>
    >(
      Prisma.sql`
        SELECT
          AVG(lgd.points) as avgPointsPerGame,
          AVG(CASE WHEN lgd.placement <= 2 THEN 1.0 ELSE 0.0 END) * 100 as lastTwoStandingRate
        FROM LeagueGameDeck lgd
        JOIN LeagueGame lg ON lgd.gameId = lg.id
        WHERE lg.createdAt >= ${startDate}
        ${leagueFilter}
      `
    );

    const pm = performanceMetrics[0];
    const streakData = topPlayers.slice(0, 5).map((p) => ({
      player: p.name ?? 'Unknown',
      currentStreak: 0,
      maxStreak: Number(p.wins),
    }));

    const analyticsData = {
      totalPlayers,
      totalTournaments,
      totalGames,
      winRate,
      topPlayers: topPlayers.map((p) => ({
        id: p.id,
        name: p.name ?? 'Unknown',
        wins: Number(p.wins),
        losses: Number(p.losses),
        winRate: Number(p.winRate),
        points: Number(p.points),
      })),
      tournamentHistory,
      gameTypeDistribution: gameTypes,
      performanceMetrics: {
        avgPointsPerGame: pm ? Number(pm.avgPointsPerGame) : 0,
        knockoutRate: 0,
        lastTwoStandingRate: pm ? Number(pm.lastTwoStandingRate) : 0,
        streakData,
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    logger.error('Analytics API error', error);
    return handleApiError(error);
  }
}
