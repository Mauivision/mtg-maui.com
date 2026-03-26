/**
 * Single source of truth for DB-backed leaderboard totals:
 * Commander pod points from LeagueGame (gameType commander) + draft match points from DraftEvent.
 * Used by /api/leaderboard/realtime and /api/leagues/[leagueId]/leaderboard so public and admin views stay aligned.
 */

import { prisma } from '@/lib/prisma';
import type { RealtimeLeaderboardEntry } from '@/types/leaderboard';
import type { StaticLeagueData } from '@/lib/static-league-data';
import {
  bundledLeagueDataMatchesDbLeagueName,
  getBundledLeagueDataForMerge,
  getDraftOverlayFromLeagueDataForPlayer,
} from '@/lib/static-league-data';

export type LeaderboardGameTypeFilter = 'all' | 'commander' | 'draft' | 'standard';

interface UserStats {
  points: number;
  wins: number;
  losses: number;
  lastActive: Date;
  commanderPoints: number;
  /** Commander VP from games with round 1–5. */
  commanderGame1Points: number;
  /** Commander VP from games with round 6+. */
  commanderGame2Points: number;
  draftPoints: number;
  draftPointsRound1: number;
  draftPointsRound2: number;
  totalPlacementSum: number;
  placementCount: number;
  recentForm: Array<'W' | 'L' | 'D'>;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface AggregatedLeaderboardRow {
  id: string;
  name: string;
  commanderPoints: number;
  commanderGame1Points: number;
  commanderGame2Points: number;
  draftPoints: number;
  draftLeaguePoints1: number;
  draftLeaguePoints2: number;
  points: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  averagePlacement: number;
  recentForm: Array<'W' | 'L' | 'D'>;
  rank: number;
  lastActive: Date;
  firstDraftPointsPlayedForDan?: number;
  /** When set (JSON merge), used instead of deriving draft line from DB columns only. */
  draftDetail?: string;
}

export function calculateElo(wins: number, games: number): number {
  if (games === 0) return 1500;
  const winRate = wins / games;
  return Math.round(1500 + (winRate - 0.5) * 1000);
}

/**
 * Returns all league members sorted by standings (not truncated). Callers apply limit.
 */
export async function aggregateLeaderboardFromDatabase(params: {
  leagueId: string | null;
  gameType: LeaderboardGameTypeFilter;
}): Promise<AggregatedLeaderboardRow[]> {
  const { leagueId, gameType } = params;

  let leagueJson: StaticLeagueData | null = null;
  if (
    leagueId &&
    gameType === 'all' &&
    process.env.DISABLE_JSON_DRAFT_MERGE !== 'true'
  ) {
    const leagueRow = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { name: true },
    });
    if (leagueRow?.name && bundledLeagueDataMatchesDbLeagueName(leagueRow.name)) {
      leagueJson = getBundledLeagueDataForMerge();
    }
  }

  let userIds: string[] | null = null;
  if (leagueId != null) {
    const memberships = await prisma.leagueMembership.findMany({
      where: { leagueId, active: true },
      select: { userId: true },
    });
    userIds = memberships.map((m) => m.userId);
  }

  if (leagueId != null && (!userIds || userIds.length === 0)) {
    return [];
  }

  const whereUser = userIds != null && userIds.length > 0 ? { id: { in: userIds } } : {};
  const users = await prisma.user.findMany({
    where: whereUser,
    select: { id: true, name: true },
  });

  if (users.length === 0) {
    return [];
  }

  const uidSet = new Set(users.map((u) => u.id));

  const gameWhere: { leagueId?: string | null; gameType?: 'commander' | 'draft' | 'standard' } = {};
  if (leagueId != null) gameWhere.leagueId = leagueId;
  if (gameType !== 'all') gameWhere.gameType = gameType;

  const games = await prisma.leagueGame.findMany({
    where: Object.keys(gameWhere).length > 0 ? gameWhere : undefined,
    orderBy: { date: 'asc' },
    select: { players: true, placements: true, date: true, gameType: true, round: true },
  });

  const byUser = new Map<string, UserStats>();
  for (const u of users) {
    byUser.set(u.id, {
      points: 0,
      wins: 0,
      losses: 0,
      lastActive: new Date(0),
      commanderPoints: 0,
      commanderGame1Points: 0,
      commanderGame2Points: 0,
      draftPoints: 0,
      draftPointsRound1: 0,
      draftPointsRound2: 0,
      totalPlacementSum: 0,
      placementCount: 0,
      recentForm: [],
    });
  }

  for (const g of games) {
    const placements = parseJson<Array<{ playerId: string; place?: number; points?: number }>>(
      g.placements,
      []
    );
    const date = g.date ?? new Date(0);
    const roundNum = g.round ?? 1;
    const commanderEarlyPhase = roundNum <= 5;

    for (const pl of placements) {
      const pid = pl.playerId;
      if (!uidSet.has(pid)) continue;
      const cur = byUser.get(pid);
      if (!cur) continue;

      const pts = typeof pl.points === 'number' && !Number.isNaN(pl.points) ? pl.points : 0;
      const placeKnown = typeof pl.place === 'number' && !Number.isNaN(pl.place);

      if (g.gameType === 'commander') {
        cur.commanderPoints += pts;
        if (commanderEarlyPhase) cur.commanderGame1Points += pts;
        else cur.commanderGame2Points += pts;
        if (placeKnown) {
          const rank = pl.place as number;
          cur.totalPlacementSum += rank;
          cur.placementCount += 1;
          if (rank === 1) cur.wins += 1;
          else if (rank > 1) cur.losses += 1;
          cur.recentForm.push(rank === 1 ? 'W' : 'L');
        }
        if (date > cur.lastActive) cur.lastActive = date;
      }
    }
  }

  const allDrafts = await prisma.draftEvent.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      matches: true,
    },
  });

  const timUserId =
    users.find((u) => u.name && u.name.trim().toLowerCase() === 'tim')?.id ?? null;
  let timFirstDraftPointsPlayedForDan = 0;

  for (let draftIndex = 0; draftIndex < allDrafts.length; draftIndex++) {
    const draft = allDrafts[draftIndex];
    if (!draft.participants.length) continue;

    const participants = draft.participants as Array<{
      id: string;
      user: { id: string; name: string | null; email: string };
    }>;
    const matches = draft.matches as Array<{
      participant1Id: string;
      participant2Id: string;
      gamesWon1: number;
      gamesWon2: number;
    }>;

    const byParticipant = new Map<
      string,
      { userId: string; matchWins: number; matchPoints: number }
    >(
      participants.map((p) => [
        p.id,
        { userId: p.user.id, matchWins: 0, matchPoints: 0 },
      ])
    );

    for (const m of matches) {
      const p1 = byParticipant.get(m.participant1Id);
      const p2 = byParticipant.get(m.participant2Id);
      if (!p1 || !p2) continue;
      if (m.gamesWon1 > m.gamesWon2) {
        p1.matchWins += 1;
        p1.matchPoints += 3;
      } else if (m.gamesWon2 > m.gamesWon1) {
        p2.matchWins += 1;
        p2.matchPoints += 3;
      }
    }

    const isFirstDraft = draftIndex === 0;

    for (const [, value] of byParticipant) {
      const stats = byUser.get(value.userId);
      if (!stats) continue;
      if (isFirstDraft && timUserId !== null && value.userId === timUserId) {
        timFirstDraftPointsPlayedForDan = value.matchPoints;
      } else {
        stats.draftPoints += value.matchPoints;
      }
      if (isFirstDraft) {
        if (timUserId !== null && value.userId === timUserId) {
          /* Tim’s first-draft VP excluded from league total */
        } else {
          stats.draftPointsRound1 += value.matchPoints;
        }
      } else {
        stats.draftPointsRound2 += value.matchPoints;
      }
    }
  }

  const sorted = Array.from(byUser.entries())
    .map(([id, s]) => {
      const u = users.find((x) => x.id === id);
      const commanderPoints = s.commanderPoints;
      const displayName = u?.name ?? 'Unknown Player';

      let draftPoints = s.draftPoints;
      let draftLeaguePoints1 = s.draftPointsRound1;
      let draftLeaguePoints2 = s.draftPointsRound2;
      let firstDraftPts =
        timUserId !== null && id === timUserId ? timFirstDraftPointsPlayedForDan : undefined;
      let draftDetailMerged: string | undefined;

      if (leagueJson) {
        const overlay = getDraftOverlayFromLeagueDataForPlayer(leagueJson, displayName);
        draftPoints = overlay.draftPoints;
        draftLeaguePoints1 = overlay.draftLeaguePoints1;
        draftLeaguePoints2 = overlay.draftLeaguePoints2;
        firstDraftPts = overlay.firstDraftPointsPlayedForDan;
        draftDetailMerged = overlay.draftDetail;
      }

      const totalPoints = commanderPoints + draftPoints;
      const gamesPlayed = s.wins + s.losses;
      const winRate = gamesPlayed > 0 ? Math.round((s.wins / gamesPlayed) * 1000) / 10 : 0;
      const recentForm = s.recentForm.slice(-5);
      const averagePlacement =
        s.placementCount > 0 ? s.totalPlacementSum / s.placementCount : 0;

      return {
        id,
        name: displayName,
        commanderPoints,
        commanderGame1Points: s.commanderGame1Points,
        commanderGame2Points: s.commanderGame2Points,
        draftPoints,
        draftLeaguePoints1,
        draftLeaguePoints2,
        points: totalPoints,
        wins: s.wins,
        losses: s.losses,
        gamesPlayed,
        winRate,
        averagePlacement,
        recentForm,
        lastActive: s.lastActive,
        firstDraftPointsPlayedForDan: firstDraftPts,
        draftDetail: draftDetailMerged,
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
  const rows: AggregatedLeaderboardRow[] = [];
  for (const row of sorted) {
    rank += 1;
    rows.push({
      ...row,
      rank,
      firstDraftPointsPlayedForDan:
        row.firstDraftPointsPlayedForDan && row.firstDraftPointsPlayedForDan > 0
          ? row.firstDraftPointsPlayedForDan
          : undefined,
    });
  }

  return rows;
}

/** Draft subline for DB-backed leaderboard (bonuses are folded into draft league point columns). */
function draftDetailFromAggregatedRow(e: AggregatedLeaderboardRow): string | undefined {
  if (e.draftDetail) return e.draftDetail;
  const d1 = e.draftLeaguePoints1 ?? 0;
  const d2 = e.draftLeaguePoints2 ?? 0;
  const segments: string[] = [];
  if (d1 > 0) segments.push(`First Draft: ${d1}`);
  if (d2 > 0) segments.push(`Second Draft: ${d2}`);
  if (segments.length > 0) return `Draft - ${segments.join(' | ')}`;
  if ((e.firstDraftPointsPlayedForDan ?? 0) > 0) {
    return 'First draft (for Dan): not in league total';
  }
  return undefined;
}

export function aggregatedRowsToRealtimeEntries(
  rows: AggregatedLeaderboardRow[],
  limit: number
): RealtimeLeaderboardEntry[] {
  return rows.slice(0, limit).map((e) => ({
    id: e.id,
    name: e.name,
    points: e.points,
    commanderPoints: e.commanderPoints,
    commanderGame1Points: e.commanderGame1Points,
    commanderGame2Points: e.commanderGame2Points,
    draftPoints: e.draftPoints,
    draftLeaguePoints1: e.draftLeaguePoints1,
    draftLeaguePoints2: e.draftLeaguePoints2,
    firstDraftPointsPlayedForDan: e.firstDraftPointsPlayedForDan,
    draftDetail: draftDetailFromAggregatedRow(e),
    wins: e.wins,
    losses: e.losses,
    gamesPlayed: e.gamesPlayed,
    winRate: e.winRate,
    currentStreak: e.wins > e.losses ? 1 : 0,
    bestStreak: e.wins,
    rank: e.rank,
    lastActive: e.lastActive.toISOString(),
    goldObjectives: 0,
    silverObjectives: 0,
    trend: 'same',
  }));
}
