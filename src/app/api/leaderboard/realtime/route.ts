import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import type { RealtimeLeaderboardEntry } from '@/types/leaderboard';

const querySchema = z.object({
  gameType: z.enum(['all', 'commander', 'draft', 'standard']).default('all'),
  leagueId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
});

interface UserStats {
  points: number;
  wins: number;
  losses: number;
  lastActive: Date;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Realtime leaderboard aggregates from LeagueGame.placements (same source as
 * Wizards Leaderboard tab). Edits in Wizards → Leaderboard show here.
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
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { gameType, leagueId, limit } = validated.data;

    let userIds: string[] | null = null;
    if (leagueId != null) {
      const memberships = await prisma.leagueMembership.findMany({
        where: { leagueId, active: true },
        select: { userId: true },
      });
      userIds = memberships.map((m) => m.userId);
    }

    if (leagueId != null && (!userIds || userIds.length === 0)) {
      return NextResponse.json({ entries: [] });
    }

    const whereUser = userIds != null && userIds.length > 0 ? { id: { in: userIds } } : {};
    const users = await prisma.user.findMany({
      where: whereUser,
      select: { id: true, name: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ entries: [] });
    }

    const uidSet = new Set(users.map((u) => u.id));

    const gameWhere: { leagueId?: string | null; gameType?: string } = {};
    if (leagueId != null) gameWhere.leagueId = leagueId;
    if (gameType !== 'all') gameWhere.gameType = gameType;

    const games = await prisma.leagueGame.findMany({
      where: Object.keys(gameWhere).length > 0 ? gameWhere : undefined,
      select: { players: true, placements: true, date: true },
    });

    const byUser = new Map<string, UserStats>();
    for (const u of users) {
      byUser.set(u.id, { points: 0, wins: 0, losses: 0, lastActive: new Date(0) });
    }

    for (const g of games) {
      const placements = parseJson<Array<{ playerId: string; place?: number; points?: number }>>(
        g.placements,
        []
      );
      const date = g.date ?? new Date(0);

      for (const pl of placements) {
        const pid = pl.playerId;
        if (!uidSet.has(pid)) continue;
        const cur = byUser.get(pid);
        if (!cur) continue;

        const pts = typeof pl.points === 'number' ? pl.points : 0;
        const place = typeof pl.place === 'number' ? pl.place : 1;

        cur.points += pts;
        if (place === 1) cur.wins += 1;
        else if (place > 1) cur.losses += 1;
        if (date > cur.lastActive) cur.lastActive = date;
      }
    }

    const list: Array<Omit<RealtimeLeaderboardEntry, 'previousRank' | 'trend' | 'playerId' | 'avatar'>> = [];
    const sorted = Array.from(byUser.entries())
      .map(([id, s]) => {
        const u = users.find((x) => x.id === id);
        return {
          id,
          name: u?.name ?? 'Unknown Player',
          ...s,
          gamesPlayed: s.wins + s.losses,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        const wa = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
        const wb = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
        return wb - wa;
      });

    let rank = 0;
    for (const row of sorted) {
      rank += 1;
      const gamesPlayed = row.wins + row.losses;
      const winRate = gamesPlayed > 0 ? Math.round((row.wins / gamesPlayed) * 1000) / 10 : 0;
      list.push({
        id: row.id,
        name: row.name,
        points: row.points,
        wins: row.wins,
        losses: row.losses,
        gamesPlayed,
        winRate,
        currentStreak: row.wins > row.losses ? 1 : 0,
        bestStreak: row.wins,
        rank,
        lastActive: row.lastActive.toISOString(),
        goldObjectives: 0,
        silverObjectives: 0,
      });
    }

    const entries = list.slice(0, limit).map((e, index) => ({
      ...e,
      playerId: e.id,
      previousRank: index > 0 ? list[index - 1].rank : e.rank,
      trend: 'same' as const,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    logger.error('Realtime leaderboard API error', error);
    return handleApiError(error);
  }
}
