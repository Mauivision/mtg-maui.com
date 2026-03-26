import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode, getStaticLeaderboard } from '@/lib/static-league-data';
import {
  aggregateLeaderboardFromDatabase,
  aggregatedRowsToRealtimeEntries,
} from '@/lib/leaderboard-db-aggregate';

const querySchema = z.object({
  gameType: z.enum(['all', 'commander', 'draft', 'standard']).default('all'),
  leagueId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const NO_STORE = { 'Cache-Control': 'no-store, must-revalidate' as const };

/**
 * Realtime leaderboard: Commander (LeagueGame) + Draft (DraftEvent), same totals as
 * /api/leagues/[leagueId]/leaderboard. Uses static JSON when DB is off.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = querySchema.safeParse({
      gameType: searchParams.get('gameType') ?? 'all',
      leagueId: searchParams.get('leagueId') ?? undefined,
      limit: searchParams.get('limit') ?? '10',
    });

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400, headers: NO_STORE });
    }

    const { gameType, leagueId, limit } = validated.data;

    if (isStaticLeagueDataMode()) {
      const entries = getStaticLeaderboard(leagueId, limit);
      return NextResponse.json({ entries }, { headers: NO_STORE });
    }

    try {
      const rows = await aggregateLeaderboardFromDatabase({
        leagueId: leagueId ?? null,
        gameType,
      });
      const entries = aggregatedRowsToRealtimeEntries(rows, limit);
      return NextResponse.json({ entries }, { headers: NO_STORE });
    } catch (error) {
      logger.warn('Leaderboard DB unavailable; serving corrected static league-data.json', {
        err: error instanceof Error ? error.message : String(error),
      });
      const entries = getStaticLeaderboard(leagueId, limit);
      return NextResponse.json({ entries, source: 'static-json' as const }, { headers: NO_STORE });
    }
  } catch (error) {
    logger.error('Realtime leaderboard API error', error);
    return handleApiError(error);
  }
}
