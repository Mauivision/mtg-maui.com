/**
 * Static league data — used when DATABASE_URL is not set or USE_STATIC_LEAGUE_DATA=true.
 * Edit src/data/league-data.json to update players, games, and scores.
 */

/** Returns true when app should use static JSON data instead of database. */
export function isStaticLeagueDataMode(): boolean {
  if (process.env.USE_STATIC_LEAGUE_DATA === 'true') return true;
  const url = process.env.DATABASE_URL?.trim() ?? '';
  if (!url) return true;
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) return true;
  return false;
}

import { readFileSync } from 'fs';
import { join } from 'path';

export interface StaticPlayer {
  id: string;
  name: string;
  commander: string;
  /** If false, player is dropped/replaced and excluded from leaderboard and charts (e.g. Aaron H replaced by Tim). */
  active?: boolean;
}

export interface StaticGameResult {
  playerId: string;
  place: number;
  points: number;
  /**
   * Optional score-sheet breakdown for fully dynamic game tables.
   * When present, UI can render Win/Elims/Heads-up/Golden/Silver/In-game VP columns.
   */
  breakdown?: {
    win?: number;
    elims?: number;
    headsUp?: number;
    golden?: number;
    silver?: number;
    inGameVp?: number;
  };
}

export interface StaticGame {
  date: string;
  round: number;
  pod: string;
  results: StaticGameResult[];
  /** Optional pod report (e.g. how the winner won); shown on the scoring page when set. */
  notes?: string;
}

export interface StaticDraftStanding {
  name: string;
  points: number;
  /** Extra draft points (e.g. sweep bonus), included in totals. */
  bonusPoints?: number;
  /** Shown in leaderboard subline next to draft totals. */
  note?: string;
}

export interface StaticLeagueData {
  league: {
    id: string;
    name: string;
    description?: string;
    format: string;
    status: string;
    startDate: string;
    endDate: string | null;
  };
  players: StaticPlayer[];
  games: StaticGame[];
  /** First 1v1 draft standings (VP / match points). */
  draftStandings?: {
    draftName: string;
    standings: StaticDraftStanding[];
  };
  /** Optional second (or later) draft — merged into leaderboard + combined draft chart. */
  secondDraftStandings?: {
    draftName: string;
    standings: StaticDraftStanding[];
  };
}

/** Ordered draft blocks for aggregation (first = Tim special-case for “played for Dan”). */
function getDraftBlocks(d: StaticLeagueData): { draftName: string; standings: StaticDraftStanding[] }[] {
  const blocks: { draftName: string; standings: StaticDraftStanding[] }[] = [];
  if (d.draftStandings?.standings?.length) blocks.push(d.draftStandings);
  if (d.secondDraftStandings?.standings?.length) blocks.push(d.secondDraftStandings);
  return blocks;
}

function rowDraftTotal(s: StaticDraftStanding): number {
  return s.points + (s.bonusPoints ?? 0);
}

/** Normalize names so "Aaron V" matches "Aaron V." in JSON standings. */
function personKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ');
}

function findStandingRow(standings: StaticDraftStanding[], displayName: string): StaticDraftStanding | undefined {
  const k = personKey(displayName);
  return standings.find((s) => personKey(s.name) === k);
}

/** Sum draft points per player across blocks; Tim’s points from block 0 are excluded from his total. */
function draftPointsByPlayerName(d: StaticLeagueData): Map<string, number> {
  const blocks = getDraftBlocks(d);
  const map = new Map<string, number>();
  for (let bi = 0; bi < blocks.length; bi++) {
    for (const s of blocks[bi].standings) {
      const name = s.name.trim();
      if (bi === 0 && personKey(name) === 'tim') continue;
      const key = personKey(name);
      map.set(key, (map.get(key) ?? 0) + rowDraftTotal(s));
    }
  }
  return map;
}

/** League-counting draft VP for one block (block 0 Tim = 0 toward total). */
function draftLeaguePointsForBlock(
  d: StaticLeagueData,
  displayName: string,
  blockIndex: number
): number {
  const blocks = getDraftBlocks(d);
  if (blockIndex >= blocks.length) return 0;
  const row = findStandingRow(blocks[blockIndex].standings, displayName);
  if (!row) return 0;
  if (blockIndex === 0 && personKey(displayName) === 'tim') return 0;
  return rowDraftTotal(row);
}

/** Human-readable draft breakdown for leaderboard subline (bonuses per draft). */
function buildDraftDetailLine(d: StaticLeagueData, displayName: string): string | undefined {
  const blocks = getDraftBlocks(d);
  const key = personKey(displayName);
  const segments: string[] = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const row = findStandingRow(blocks[bi].standings, displayName);
    if (!row) continue;
    if (bi === 0 && key === 'tim') continue;
    const total = rowDraftTotal(row);
    if (total <= 0) continue;
    const short = blocks[bi].draftName.replace(/\s*\(1v1\)\s*$/i, '').trim();
    const bonus = row.bonusPoints ?? 0;
    if (bonus > 0) {
      segments.push(`${short}: ${row.points}+${bonus}${row.note ? ` (${row.note})` : ''}`);
    } else {
      segments.push(`${short}: ${row.points}`);
    }
  }
  if (segments.length === 0) return undefined;
  // Keep this string ASCII-only so it renders reliably in JSON->UI paths.
  return `Draft - ${segments.join(' | ')}`;
}

function timFirstDraftPointsFromStatic(d: StaticLeagueData): number {
  const first = d.draftStandings?.standings;
  if (!first?.length) return 0;
  const row = findStandingRow(first, 'Tim');
  return row ? rowDraftTotal(row) : 0;
}

/** True when the DB league name matches the bundled JSON league (for draft VP overlay in DB mode). */
export function bundledLeagueDataMatchesDbLeagueName(dbLeagueName: string): boolean {
  try {
    const d = loadData();
    return d.league.name.trim() === dbLeagueName.trim();
  } catch {
    return false;
  }
}

/** Bundled league file (same source as static mode). */
export function getBundledLeagueDataForMerge(): StaticLeagueData {
  return loadData();
}

/**
 * Draft columns from league-data.json for one display name (same rules as getStaticLeaderboard).
 * Used when Postgres league name matches bundled JSON so totals match corrected draft standings.
 */
export function getDraftOverlayFromLeagueDataForPlayer(
  d: StaticLeagueData,
  displayName: string
): {
  draftPoints: number;
  draftLeaguePoints1: number;
  draftLeaguePoints2: number;
  draftDetail?: string;
  firstDraftPointsPlayedForDan?: number;
} {
  const draftPts = draftPointsByPlayerName(d).get(personKey(displayName)) ?? 0;
  const d1 = draftLeaguePointsForBlock(d, displayName, 0);
  const d2 = draftLeaguePointsForBlock(d, displayName, 1);
  const isTim = personKey(displayName) === 'tim';
  const timFirst = timFirstDraftPointsFromStatic(d);
  return {
    draftPoints: draftPts,
    draftLeaguePoints1: d1,
    draftLeaguePoints2: d2,
    draftDetail: buildDraftDetailLine(d, displayName),
    firstDraftPointsPlayedForDan: isTim && timFirst > 0 ? timFirst : undefined,
  };
}

let cached: StaticLeagueData | null = null;

function loadData(): StaticLeagueData {
  // In development, always re-read the file so edits to league-data.json show without restarting the dev server.
  // In production, cache once (JSON is bundled / stable at deploy time).
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && cached) return cached;
  try {
    const path = join(process.cwd(), 'src', 'data', 'league-data.json');
    const raw = readFileSync(path, 'utf-8');
    cached = JSON.parse(raw) as StaticLeagueData;
    return cached!;
  } catch (e) {
    cached = {
      league: {
        id: 'maui-static',
        name: 'Maui Commander League',
        description: 'Static data — no database',
        format: 'commander',
        status: 'active',
        startDate: '2026-01-01',
        endDate: null,
      },
      players: [],
      games: [],
    };
    return cached;
  }
}

export function getStaticLeagues() {
  const d = loadData();
  return [d.league];
}

export function getStaticLeagueStatus(leagueId?: string) {
  const d = loadData();
  const activePlayers = d.players.filter((p) => p.active !== false);
  const league = leagueId ? activePlayers.length ? d.league : null : d.league;
  if (!league) return null;

  /** Same totals and ordering as the main leaderboard (commander VP + draft match points). */
  const topPlayers = getStaticLeaderboard(leagueId, 3).map((e) => ({
    id: e.id,
    name: e.name,
    points: e.points,
  }));

  return {
    league: {
      id: league.id,
      name: league.name,
      description: league.description ?? null,
      status: league.status,
      format: league.format,
      startDate: league.startDate ? new Date(league.startDate).toISOString() : null,
      endDate: league.endDate ? new Date(league.endDate).toISOString() : null,
    },
    stats: {
      totalPlayers: activePlayers.length,
      totalGames: d.games.length,
      totalDrafts: 2,
      completedGames: d.games.length,
      activeGames: 0,
      upcomingGames: 0,
    },
    recentGames: d.games.slice(0, 5).map((g) => ({
      id: g.pod,
      gameType: 'commander',
      date: new Date(g.date).toISOString(),
      participants: g.results.length,
    })),
    topPlayers,
  };
}

export function getStaticLeaderboard(leagueId?: string, limit = 20) {
  const d = loadData();
  const activeIds = new Set(d.players.filter((p) => p.active !== false).map((p) => p.id));
  const nameMap = new Map(d.players.map((p) => [p.id, p.name]));
  const byPlayer = new Map<
    string,
    {
      commanderPoints: number;
      commanderG1: number;
      commanderG2: number;
      wins: number;
      losses: number;
      lastActive: Date;
    }
  >();

  for (const p of d.players) {
    byPlayer.set(p.id, {
      commanderPoints: 0,
      commanderG1: 0,
      commanderG2: 0,
      wins: 0,
      losses: 0,
      lastActive: new Date(0),
    });
  }

  for (const g of d.games) {
    const date = new Date(g.date);
    const phaseEarly = (g.round ?? 0) <= 5;
    for (const r of g.results) {
      const cur = byPlayer.get(r.playerId);
      if (!cur) continue;
      cur.commanderPoints += r.points;
      if (phaseEarly) cur.commanderG1 += r.points;
      else cur.commanderG2 += r.points;
      const placeOk = typeof r.place === 'number' && !Number.isNaN(r.place);
      if (placeOk) {
        if (r.place === 1) cur.wins += 1;
        else cur.losses += 1;
      }
      if (date > cur.lastActive) cur.lastActive = date;
    }
  }

  const draftPointsByName = draftPointsByPlayerName(d);

  // Tim played for Dan in first draft: show points but do not add to his total
  const timFirstDraftPts = timFirstDraftPointsFromStatic(d);

  const sorted = Array.from(byPlayer.entries())
    .filter(([id]) => activeIds.has(id))
    .map(([id, s]) => {
      const name = nameMap.get(id) ?? id;
      const isTim = personKey(name) === 'tim';
      // Tim’s first-draft points are excluded in draftPointsByPlayerName; later drafts still count.
      const draftPts = draftPointsByName.get(personKey(name)) ?? 0;
      const totalPoints = s.commanderPoints + draftPts;
      return {
        id,
        name,
        commanderPoints: s.commanderPoints,
        commanderGame1Points: s.commanderG1,
        commanderGame2Points: s.commanderG2,
        draftPoints: draftPts,
        draftLeaguePoints1: draftLeaguePointsForBlock(d, name, 0),
        draftLeaguePoints2: draftLeaguePointsForBlock(d, name, 1),
        firstDraftPointsPlayedForDan: isTim && timFirstDraftPts > 0 ? timFirstDraftPts : undefined,
        points: totalPoints,
        wins: s.wins,
        losses: s.losses,
        gamesPlayed: s.wins + s.losses,
        lastActive: s.lastActive,
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
  return sorted.slice(0, limit).map((row) => {
    rank += 1;
    const winRate = row.gamesPlayed > 0 ? Math.round((row.wins / row.gamesPlayed) * 1000) / 10 : 0;
    const draftDetail = buildDraftDetailLine(d, row.name);
    return {
      id: row.id,
      name: row.name,
      points: row.points,
      commanderPoints: row.commanderPoints,
      commanderGame1Points: row.commanderGame1Points,
      commanderGame2Points: row.commanderGame2Points,
      draftPoints: row.draftPoints,
      draftLeaguePoints1: row.draftLeaguePoints1,
      draftLeaguePoints2: row.draftLeaguePoints2,
      firstDraftPointsPlayedForDan: row.firstDraftPointsPlayedForDan,
      draftDetail,
      wins: row.wins,
      losses: row.losses,
      gamesPlayed: row.gamesPlayed,
      winRate,
      currentStreak: row.wins > row.losses ? 1 : 0,
      bestStreak: row.wins,
      rank,
      lastActive: row.lastActive.toISOString(),
      goldObjectives: 0,
      silverObjectives: 0,
      trend: 'same' as const,
    };
  });
}

export function getStaticWave1(leagueId?: string) {
  const d = loadData();
  const activePlayers = d.players.filter((p) => p.active !== false);
  const activeIds = new Set(activePlayers.map((p) => p.id));
  const nameMap = new Map(d.players.map((p) => [p.id, p.name]));
  const byPlayer = new Map<string, { points: number; wins: number; losses: number }>();

  for (const p of d.players) {
    byPlayer.set(p.id, { points: 0, wins: 0, losses: 0 });
  }

  for (const g of d.games) {
    for (const r of g.results) {
      const cur = byPlayer.get(r.playerId);
      if (!cur) continue;
      cur.points += r.points;
      const placeOk = typeof r.place === 'number' && !Number.isNaN(r.place);
      if (placeOk) {
        if (r.place === 1) cur.wins += 1;
        else cur.losses += 1;
      }
    }
  }

  const playerStats = Array.from(byPlayer.entries())
    .filter(([id]) => activeIds.has(id))
    .map(([id, s]) => ({
      id,
      name: nameMap.get(id) ?? id,
      ...s,
      gamesPlayed: s.wins + s.losses,
      winRate: s.wins + s.losses > 0 ? Math.round((s.wins / (s.wins + s.losses)) * 1000) / 10 : 0,
      lastActive: new Date().toISOString(),
    }))
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const pods = d.games.map((g) => ({
    pod: g.pod,
    date: new Date(g.date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    }),
    round: g.round,
    results: g.results.map((r) => ({
      playerId: r.playerId,
      playerName: nameMap.get(r.playerId) ?? r.playerId,
      place: r.place,
      points: r.points,
    })),
  }));

  return { players: playerStats, pods };
}

export function getStaticStats() {
  const d = loadData();
  return {
    totalUsers: d.players.length,
    totalGames: d.games.length,
    totalLeagues: 1,
    totalDrafts: 2,
    totalEvents: 0,
    newsCount: 0,
  };
}

export function getStaticCharacterSheets(leagueId?: string) {
  const d = loadData();
  const allPlayers = d.players;
  const byPlayer = new Map<
    string,
    { totalPoints: number; wins: number; losses: number; placements: number[] }
  >();

  for (const p of d.players) {
    byPlayer.set(p.id, { totalPoints: 0, wins: 0, losses: 0, placements: [] });
  }

  for (const g of d.games) {
    for (const r of g.results) {
      const cur = byPlayer.get(r.playerId);
      if (!cur) continue;
      cur.totalPoints += r.points;
      const placeOk = typeof r.place === 'number' && !Number.isNaN(r.place);
      if (placeOk) {
        cur.placements.push(r.place);
        if (r.place === 1) cur.wins += 1;
        else cur.losses += 1;
      }
    }
  }

  const players = allPlayers.map((p) => {
    const s = byPlayer.get(p.id) ?? {
      totalPoints: 0,
      wins: 0,
      losses: 0,
      placements: [] as number[],
    };
    const gamesPlayed = s.wins + s.losses;
    const winRate = gamesPlayed > 0 ? (s.wins / gamesPlayed) * 100 : 0;
    const avgPlace =
      s.placements.length > 0
        ? s.placements.reduce((a, b) => a + b, 0) / s.placements.length
        : 0;
    // Level on character sheets = number of commander games played (pods entered).
    const level = gamesPlayed;

    return {
      id: p.id,
      playerName: p.name,
      commander: p.commander,
      active: p.active !== false,
      level,
      totalPoints: s.totalPoints,
      gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      goldObjectives: 0,
      silverObjectives: 0,
      winRate,
      averagePlacement: avgPlace,
      rank: 0,
    };
  });

  const sorted = players
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.averagePlacement - b.averagePlacement;
    })
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return { players: sorted };
}

/** Commander games for /score page when using static data or DB empty. */
export function getStaticCommanderGames() {
  const d = loadData();
  const playerMap = new Map(d.players.map((p) => [p.id, p]));

  return d.games.map((g, idx) => {
    const sorted = [...g.results].sort((a, b) => a.place - b.place);
    const winner = sorted[0];
    const winnerPlayer = winner ? playerMap.get(winner.playerId) : null;
    return {
      id: `static-${idx}-${g.date}`,
      name: g.pod,
      totalPlayers: g.results.length,
      createdAt: new Date(g.date).toISOString(),
      notes: g.notes?.trim() || undefined,
      winner: winnerPlayer
        ? {
            id: winner.playerId,
            name: winnerPlayer.name,
            commander: winnerPlayer.commander || '—',
          }
        : { id: '', name: '—', commander: '—' },
      players: sorted.map((r) => {
        const p = playerMap.get(r.playerId);
        const b = r.breakdown;
        const knockouts = typeof b?.elims === 'number' && !Number.isNaN(b.elims) ? b.elims : 0;
        const goldAchievements = typeof b?.golden === 'number' && !Number.isNaN(b.golden) ? b.golden : 0;
        const silverAchievements = typeof b?.silver === 'number' && !Number.isNaN(b.silver) ? b.silver : 0;
        return {
          id: r.playerId,
          name: p?.name ?? r.playerId,
          commander: p?.commander ?? '—',
          placement: r.place,
          points: r.points,
          knockouts,
          goldAchievements,
          silverAchievements,
          // Extra columns for /games page (safe to ignore elsewhere).
          breakdown: b ?? undefined,
        };
      }),
    };
  });
}

/** Draft points for chart: combined across all static draft blocks (Tim’s first draft excluded from his bar). */
export function getStaticDraftStandings(): { draftName: string; standings: StaticDraftStanding[] } | null {
  const d = loadData();
  const blocks = getDraftBlocks(d);
  if (!blocks.length) return null;

  const displayByKey = new Map<string, string>();
  for (const b of blocks) {
    for (const s of b.standings) {
      displayByKey.set(personKey(s.name), s.name.trim());
    }
  }

  const merged = draftPointsByPlayerName(d);
  const standings = Array.from(merged.entries())
    .map(([key, points]) => ({ name: displayByKey.get(key) ?? key, points }))
    .sort((a, b) => b.points - a.points);

  const names = blocks.map((b) => b.draftName).join(' + ');
  return { draftName: names || 'Draft points (combined)', standings };
}
