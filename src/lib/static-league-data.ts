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
}

export interface StaticGame {
  date: string;
  round: number;
  pod: string;
  results: StaticGameResult[];
}

export interface StaticDraftStanding {
  name: string;
  points: number;
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
  draftStandings?: {
    draftName: string;
    standings: StaticDraftStanding[];
  };
}

let cached: StaticLeagueData | null = null;

function loadData(): StaticLeagueData {
  if (cached) return cached;
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

  const nameMap = new Map(d.players.map((p) => [p.id, p.name]));
  const activeIds = new Set(activePlayers.map((p) => p.id));
  const byPlayer = new Map<string, { points: number; name: string }>();

  for (const g of d.games) {
    for (const r of g.results) {
      const cur = byPlayer.get(r.playerId) ?? { points: 0, name: nameMap.get(r.playerId) ?? r.playerId };
      cur.points += r.points;
      byPlayer.set(r.playerId, cur);
    }
  }

  const topPlayers = Array.from(byPlayer.entries())
    .filter(([id]) => activeIds.has(id))
    .map(([id, v]) => ({ playerId: id, playerName: v.name, totalPoints: v.points }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 3);

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
      totalDrafts: 1,
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
    topPlayers: topPlayers.map((p) => ({
      id: p.playerId,
      name: p.playerName,
      points: p.totalPoints,
    })),
  };
}

export function getStaticLeaderboard(leagueId?: string, limit = 20) {
  const d = loadData();
  const activeIds = new Set(d.players.filter((p) => p.active !== false).map((p) => p.id));
  const nameMap = new Map(d.players.map((p) => [p.id, p.name]));
  const byPlayer = new Map<
    string,
    { commanderPoints: number; wins: number; losses: number; lastActive: Date }
  >();

  for (const p of d.players) {
    byPlayer.set(p.id, { commanderPoints: 0, wins: 0, losses: 0, lastActive: new Date(0) });
  }

  for (const g of d.games) {
    const date = new Date(g.date);
    for (const r of g.results) {
      const cur = byPlayer.get(r.playerId);
      if (!cur) continue;
      cur.commanderPoints += r.points;
      if (r.place === 1) cur.wins += 1;
      else cur.losses += 1;
      if (date > cur.lastActive) cur.lastActive = date;
    }
  }

  const draftStandings = getStaticDraftStandings();
  const draftPointsByName = new Map<string, number>();
  if (draftStandings?.standings?.length) {
    for (const s of draftStandings.standings) {
      draftPointsByName.set(s.name, (draftPointsByName.get(s.name) ?? 0) + s.points);
    }
  }

  const sorted = Array.from(byPlayer.entries())
    .filter(([id]) => activeIds.has(id))
    .map(([id, s]) => {
      const name = nameMap.get(id) ?? id;
      const draftPts = draftPointsByName.get(name) ?? 0;
      const totalPoints = s.commanderPoints + draftPts;
      return {
        id,
        name,
        commanderPoints: s.commanderPoints,
        draftPoints: draftPts,
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
    return {
      id: row.id,
      name: row.name,
      points: row.points,
      commanderPoints: row.commanderPoints,
      draftPoints: row.draftPoints,
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
      playerId: row.id,
      previousRank: rank,
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
      if (r.place === 1) cur.wins += 1;
      else cur.losses += 1;
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
    totalEvents: 0,
    newsCount: 0,
  };
}

export function getStaticCharacterSheets(leagueId?: string) {
  const d = loadData();
  const activePlayers = d.players.filter((p) => p.active !== false);
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
      cur.placements.push(r.place);
      if (r.place === 1) cur.wins += 1;
      else cur.losses += 1;
    }
  }

  const players = activePlayers.map((p) => {
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
    const xp = s.totalPoints * 10;
    const level = Math.max(1, Math.floor(xp / 200) + 1);

    return {
      id: p.id,
      playerName: p.name,
      commander: p.commander,
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
      winner: winnerPlayer
        ? {
            id: winner.playerId,
            name: winnerPlayer.name,
            commander: winnerPlayer.commander || '—',
          }
        : { id: '', name: '—', commander: '—' },
      players: sorted.map((r) => {
        const p = playerMap.get(r.playerId);
        return {
          id: r.playerId,
          name: p?.name ?? r.playerId,
          commander: p?.commander ?? '—',
          placement: r.place,
          points: r.points,
          knockouts: 0,
        };
      }),
    };
  });
}

/** Draft game points (1v1 standings) for the draft points chart. */
export function getStaticDraftStandings(): { draftName: string; standings: StaticDraftStanding[] } | null {
  const d = loadData();
  if (d.draftStandings?.standings?.length) {
    return { draftName: d.draftStandings.draftName, standings: d.draftStandings.standings };
  }
  return null;
}
