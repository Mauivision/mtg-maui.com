import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

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

    const topPlayers = await prisma.$queryRaw<
      Array<{ playerId: string; playerName: string; totalPoints: number }>
    >`
      SELECT lgd.playerId, u.name as playerName, SUM(lgd.points) as totalPoints
      FROM LeagueGameDeck lgd
      JOIN User u ON lgd.playerId = u.id
      JOIN LeagueGame lg ON lgd.gameId = lg.id
      WHERE lg.leagueId = ${league.id}
      GROUP BY lgd.playerId, u.name
      ORDER BY totalPoints DESC
      LIMIT 3
    `;

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
      topPlayers: topPlayers.map((p) => ({
        id: p.playerId,
        name: p.playerName,
        points: Number(p.totalPoints),
      })),
    });
  } catch (error) {
    logger.error('League status API error', error);
    return handleApiError(error);
  }
}
