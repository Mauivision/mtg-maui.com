import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import type { LeaderboardEntry } from '@/types/league';

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function calculateElo(wins: number, games: number): number {
  if (games === 0) return 1500;
  const winRate = wins / games;
  return Math.round(1500 + (winRate - 0.5) * 1000);
}

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || undefined;

    const memberships = await prisma.leagueMembership.findMany({
      where: { leagueId, active: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        registeredDecks: {
          include: { gameResults: { include: { game: true } } },
        },
      },
    });

    const games = await prisma.leagueGame.findMany({
      where: {
        leagueId,
        ...(gameType && { gameType }),
      },
      include: { gameDecks: { include: { deck: true } } },
    });

    const playerStats = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        totalPoints: number;
        gamesPlayed: number;
        wins: number;
        losses: number;
        averagePlacement: number;
        eloRating: number;
        recentForm: Array<'W' | 'L' | 'D'>;
      }
    >();

    for (const membership of memberships) {
      const playerId = membership.userId;
      const playerGames = games.filter((g) => {
        const ids = parseJson<string[]>(g.players, []);
        return ids.includes(playerId);
      });

      let totalPoints = 0;
      let wins = 0;
      let totalPlacements = 0;
      const recentForm: Array<'W' | 'L' | 'D'> = [];

      for (const game of playerGames) {
        const placements = parseJson<Array<{ playerId: string; place: number; points: number }>>(
          game.placements,
          []
        );
        const pl = placements.find((p) => p.playerId === playerId);
        if (!pl) continue;
        totalPoints += pl.points;
        totalPlacements += pl.place;
        if (pl.place === 1) wins++;
        recentForm.push(pl.place === 1 ? 'W' : 'L');
      }

      const gameCount = playerGames.length;
      const losses = gameCount - wins;

      playerStats.set(playerId, {
        playerId,
        playerName: membership.user?.name ?? 'Unknown Player',
        totalPoints,
        gamesPlayed: gameCount,
        wins,
        losses,
        averagePlacement: gameCount > 0 ? totalPlacements / gameCount : 0,
        eloRating: calculateElo(wins, gameCount),
        recentForm: recentForm.slice(-5),
      });
    }

    const entries: LeaderboardEntry[] = Array.from(playerStats.values())
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return a.averagePlacement - b.averagePlacement;
      })
      .map((e, i) => ({ ...e, id: e.playerId, rank: i + 1 }));

    return NextResponse.json({ entries });
  } catch (error) {
    logger.error('Error fetching leaderboard', error);
    return handleApiError(error);
  }
}
