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

    // Base user filter: optionally only league members
    let userIds: string[] | null = null;
    if (leagueId != null) {
      const memberships = await prisma.leagueMembership.findMany({
        where: { leagueId, active: true },
        select: { userId: true },
      });
      userIds = memberships.map((m) => m.userId);
    }

    // If league specified but no members, return empty
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

    const uidList = users.map((u) => u.id);

    const gameWhere: {
      playerId: { in: string[] };
      game?: { gameType?: string; leagueId?: string };
    } = { playerId: { in: uidList } };
    const gameFilter: { gameType?: string; leagueId?: string } = {};
    if (gameType !== 'all') gameFilter.gameType = gameType;
    if (leagueId != null) gameFilter.leagueId = leagueId;
    if (Object.keys(gameFilter).length > 0) gameWhere.game = gameFilter;

    const decks = await prisma.leagueGameDeck.findMany({
      where: gameWhere,
      select: {
        playerId: true,
        points: true,
        placement: true,
        game: { select: { createdAt: true } },
      },
    });

    const byUser = new Map<string, UserStats>();

    for (const u of users) {
      byUser.set(u.id, { points: 0, wins: 0, losses: 0, lastActive: new Date(0) });
    }

    for (const d of decks) {
      const cur = byUser.get(d.playerId);
      if (!cur) continue;
      cur.points += d.points;
      if (d.placement === 1) cur.wins += 1;
      else if (d.placement > 1) cur.losses += 1;
      const t = d.game?.createdAt;
      if (t && t > cur.lastActive) cur.lastActive = t;
    }

    const list: Array<Omit<RealtimeLeaderboardEntry, 'previousRank' | 'trend' | 'playerId' | 'avatar'>> = [];
    let rank = 0;
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
