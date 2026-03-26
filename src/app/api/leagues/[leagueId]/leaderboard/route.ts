import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import type { LeaderboardEntry } from '@/types/league';
import {
  aggregateLeaderboardFromDatabase,
  calculateElo,
  type LeaderboardGameTypeFilter,
} from '@/lib/leaderboard-db-aggregate';

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;
    const { searchParams } = new URL(request.url);
    const gameTypeParam = searchParams.get('gameType');
    const gameType: LeaderboardGameTypeFilter =
      gameTypeParam === 'all' ||
      gameTypeParam === 'commander' ||
      gameTypeParam === 'draft' ||
      gameTypeParam === 'standard'
        ? gameTypeParam
        : 'all';

    const rows = await aggregateLeaderboardFromDatabase({ leagueId, gameType });

    const entries: LeaderboardEntry[] = rows.map((r) => ({
      id: r.id,
      rank: r.rank,
      playerId: r.id,
      playerName: r.name,
      totalPoints: r.points,
      commanderPoints: r.commanderPoints,
      draftPoints: r.draftPoints,
      gamesPlayed: r.gamesPlayed,
      wins: r.wins,
      losses: r.losses,
      averagePlacement: r.averagePlacement,
      eloRating: calculateElo(r.wins, Math.max(r.gamesPlayed, 1)),
      recentForm: r.recentForm,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    logger.error('Error fetching leaderboard', error);
    return handleApiError(error);
  }
}
