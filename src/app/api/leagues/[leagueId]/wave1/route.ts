import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode, getStaticWave1 } from '@/lib/static-league-data';

const POD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function parseJson<T>(raw: string | unknown, fallback: T): T {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return (raw as T) ?? fallback;
}

/**
 * GET /api/leagues/[leagueId]/wave1
 * Returns player stats + Wave 1 (first game per pod) results for display on the homepage.
 * Uses static data when DATABASE_URL is not set.
 */
export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    if (isStaticLeagueDataMode()) {
      const data = getStaticWave1(leagueId);
      return NextResponse.json(data);
    }

    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Fetch league games (commander, this league), ordered by date ascending
    const games = await prisma.leagueGame.findMany({
      where: { leagueId, gameType: 'commander' },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, round: true, players: true, placements: true },
    });

    // Get all unique player IDs from games
    const allPlayerIds = new Set<string>();
    for (const g of games) {
      const placements = parseJson<Array<{ playerId?: string }>>(g.placements, []);
      placements.forEach((p) => {
        if (p?.playerId) allPlayerIds.add(p.playerId);
      });
    }

    // Fetch user names
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(allPlayerIds) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(users.map((u) => [u.id, u.name ?? 'Unknown']));

    // Build Wave 1 pod results (first 4 games = Pods A–D, or all games if more)
    const pods = games.slice(0, 6).map((g, idx) => {
      const placements = parseJson<Array<{ playerId: string; place?: number; points?: number }>>(
        g.placements,
        []
      );
      const results = placements
        .sort((a, b) => (a.place ?? 4) - (b.place ?? 4))
        .map((p) => ({
          playerId: p.playerId,
          playerName: nameMap.get(p.playerId) ?? 'Unknown',
          place: p.place ?? 0,
          points: typeof p.points === 'number' ? p.points : 0,
        }));
      const podLetter = POD_LETTERS[idx] ?? `#${idx + 1}`;
      const dateStr = g.date ? new Date(g.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '';
      return {
        pod: podLetter,
        date: dateStr,
        round: g.round,
        results,
      };
    });

    // Build player stats (aggregate from all games)
    interface UserStat {
      points: number;
      wins: number;
      losses: number;
      lastActive: Date;
    }
    const byUser = new Map<string, UserStat>();
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
        const cur = byUser.get(pl.playerId);
        if (!cur) continue;
        const pts = typeof pl.points === 'number' ? pl.points : 0;
        const place = typeof pl.place === 'number' ? pl.place : 1;
        cur.points += pts;
        if (place === 1) cur.wins += 1;
        else if (place > 1) cur.losses += 1;
        if (date > cur.lastActive) cur.lastActive = date;
      }
    }

    const playerStats = Array.from(byUser.entries())
      .map(([id, s]) => {
        const u = users.find((x) => x.id === id);
        const gamesPlayed = s.wins + s.losses;
        const winRate = gamesPlayed > 0 ? Math.round((s.wins / gamesPlayed) * 1000) / 10 : 0;
        return {
          id,
          name: u?.name ?? 'Unknown',
          points: s.points,
          wins: s.wins,
          losses: s.losses,
          gamesPlayed,
          winRate,
          lastActive: s.lastActive.toISOString(),
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return (b.winRate ?? 0) - (a.winRate ?? 0);
      })
      .map((p, i) => ({ ...p, rank: i + 1 }));

    return NextResponse.json({
      players: playerStats,
      pods,
    });
  } catch (error) {
    logger.error('Wave1 API error', error);
    return handleApiError(error);
  }
}
