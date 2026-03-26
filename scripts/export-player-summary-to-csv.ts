/**
 * One row per player: commander VP, draft points (as on live leaderboard), commander name, total, placement.
 *
 * Static: draft points from league-data.json draft standings (VP list); Tim’s first-draft VP excluded from draft/total (same as static leaderboard).
 * Postgres: commander from LeagueGame commander placements; draft from DraftMatch (3 per win); Tim first-draft exclusion matches /api/leaderboard/realtime.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

type CsvValue = string | number | boolean | null | undefined;

function loadEnvFile(filename: string) {
  const path = join(process.cwd(), filename);
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function csvEscape(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: Array<Record<string, CsvValue>>): string {
  const out: string[] = [];
  out.push(headers.map(csvEscape).join(','));
  for (const row of rows) {
    out.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return out.join('\n') + '\n';
}

function hasPostgresUrl(): boolean {
  const u = process.env.DATABASE_URL?.trim() ?? '';
  return u.startsWith('postgresql://') || u.startsWith('postgres://');
}

function normName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ');
}

const HEADERS = [
  'id',
  'player_name',
  'commander_name',
  'commander_game_points',
  'draft_game_points',
  'total_scores',
  'placement',
  'active',
] as const;

type SummaryRow = Record<string, CsvValue>;

type StaticLeagueData = {
  league: { id: string; name?: string };
  players: Array<{ id: string; name: string; commander?: string; active?: boolean }>;
  games: Array<{
    date: string;
    results: Array<{ playerId: string; place: number; points: number }>;
  }>;
  draftStandings?: { standings: Array<{ name: string; points: number }> };
};

function exportFromStatic(): SummaryRow[] {
  const path = join(process.cwd(), 'src', 'data', 'league-data.json');
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  const data = JSON.parse(readFileSync(path, 'utf-8')) as StaticLeagueData;
  const leagueId = data.league?.id ?? 'static';

  const commanderByPlayerId = new Map<string, number>();
  for (const g of data.games ?? []) {
    for (const r of g.results ?? []) {
      commanderByPlayerId.set(r.playerId, (commanderByPlayerId.get(r.playerId) ?? 0) + r.points);
    }
  }

  const draftStandings = data.draftStandings?.standings ?? [];
  const draftVpByName = new Map<string, number>();
  for (const s of draftStandings) {
    const k = normName(s.name);
    const pts = Number(s.points) || 0;
    draftVpByName.set(k, (draftVpByName.get(k) ?? 0) + pts);
  }

  const rows: SummaryRow[] = [];
  for (const p of data.players ?? []) {
    const commanderPts = commanderByPlayerId.get(p.id) ?? 0;
    const isTim = normName(p.name) === 'tim';
    const draftPts = isTim ? 0 : draftVpByName.get(normName(p.name)) ?? 0;
    const total = commanderPts + draftPts;
    const active = p.active !== false;

    rows.push({
      id: `summary:${leagueId}:${p.id}`,
      player_name: p.name,
      commander_name: p.commander ?? '',
      commander_game_points: commanderPts,
      draft_game_points: draftPts,
      total_scores: total,
      placement: '',
      active: active ? 'true' : 'false',
    });
  }

  const activeRows = rows.filter((r) => r.active === 'true');
  activeRows.sort((a, b) => {
    const tb = Number(b.total_scores) - Number(a.total_scores);
    if (tb !== 0) return tb;
    return String(a.player_name).localeCompare(String(b.player_name));
  });
  activeRows.forEach((r, i) => {
    r.placement = i + 1;
  });

  const inactiveRows = rows.filter((r) => r.active === 'false');
  inactiveRows.sort((a, b) => String(a.player_name).localeCompare(String(b.player_name)));

  return [...activeRows, ...inactiveRows];
}

function parsePlacements(raw: string): Array<{ playerId: string; place?: number; points?: number }> {
  try {
    const a = JSON.parse(raw || '[]') as Array<{
      playerId: string;
      place?: number;
      points?: number;
    }>;
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

async function exportFromPrisma(): Promise<SummaryRow[]> {
  const leagueIdFilter = process.env.EXPORT_LEAGUE_ID?.trim();
  const prisma = new PrismaClient();
  try {
    let league = leagueIdFilter
      ? await prisma.league.findUnique({ where: { id: leagueIdFilter } })
      : await prisma.league.findFirst({ where: { name: 'Maui Commander League' } });
    if (!league) {
      league = await prisma.league.findFirst({ where: { name: 'MTG Maui League' } });
    }
    if (!league) throw new Error('No league found (set EXPORT_LEAGUE_ID or create Maui Commander League).');

    const memberships = await prisma.leagueMembership.findMany({
      where: { leagueId: league.id },
      include: {
        user: { select: { id: true, name: true } },
        registeredDecks: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
          select: { commander: true },
        },
      },
    });

    const uidSet = new Set(memberships.map((m) => m.userId));
    const commanderByUser = new Map<string, number>();
    for (const uid of uidSet) commanderByUser.set(uid, 0);

    const games = await prisma.leagueGame.findMany({
      where: { leagueId: league.id, gameType: 'commander' },
      select: { placements: true },
    });
    for (const g of games) {
      for (const pl of parsePlacements(g.placements)) {
        if (!uidSet.has(pl.playerId)) continue;
        const pts = typeof pl.points === 'number' ? pl.points : 0;
        commanderByUser.set(pl.playerId, (commanderByUser.get(pl.playerId) ?? 0) + pts);
      }
    }

    const allDrafts = await prisma.draftEvent.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        participants: { include: { user: { select: { id: true, name: true } } } },
        matches: true,
      },
    });

    const draftByUser = new Map<string, number>();
    for (const uid of uidSet) draftByUser.set(uid, 0);

    const timUserId =
      memberships.find((m) => m.user.name?.trim().toLowerCase() === 'tim')?.userId ?? null;

    for (const draft of allDrafts) {
      if (!draft.participants.length) continue;
      const byParticipant = new Map<
        string,
        { userId: string; matchPoints: number }
      >(draft.participants.map((p) => [p.id, { userId: p.user.id, matchPoints: 0 }]));

      for (const m of draft.matches) {
        const p1 = byParticipant.get(m.participant1Id);
        const p2 = byParticipant.get(m.participant2Id);
        if (!p1 || !p2) continue;
        if (m.gamesWon1 > m.gamesWon2) p1.matchPoints += 3;
        else if (m.gamesWon2 > m.gamesWon1) p2.matchPoints += 3;
      }

      const isFirstDraft = allDrafts[0]?.id === draft.id;
      for (const [, v] of byParticipant) {
        if (!uidSet.has(v.userId)) continue;
        if (isFirstDraft && timUserId !== null && v.userId === timUserId) continue;
        draftByUser.set(v.userId, (draftByUser.get(v.userId) ?? 0) + v.matchPoints);
      }
    }

    const rows: SummaryRow[] = [];
    for (const m of memberships) {
      const c = commanderByUser.get(m.userId) ?? 0;
      const d = draftByUser.get(m.userId) ?? 0;
      const total = c + d;
      const commanderName = m.registeredDecks[0]?.commander ?? '';
      rows.push({
        id: `summary:${league.id}:${m.userId}`,
        player_name: m.user.name ?? m.userId,
        commander_name: commanderName,
        commander_game_points: c,
        draft_game_points: d,
        total_scores: total,
        placement: '',
        active: m.active ? 'true' : 'false',
      });
    }

    const activeRows = rows.filter((r) => r.active === 'true');
    activeRows.sort((a, b) => {
      const tb = Number(b.total_scores) - Number(a.total_scores);
      if (tb !== 0) return tb;
      return String(a.player_name).localeCompare(String(b.player_name));
    });
    activeRows.forEach((r, i) => {
      r.placement = i + 1;
    });

    const inactiveRows = rows.filter((r) => r.active === 'false');
    inactiveRows.sort((a, b) => String(a.player_name).localeCompare(String(b.player_name)));

    return [...activeRows, ...inactiveRows];
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');
  loadEnvFile('.env.development.local');
  loadEnvFile('.env.production.local');

  const forceStatic = process.env.EXPORT_PLAYER_SUMMARY_SOURCE === 'static';
  const useStatic = forceStatic || !hasPostgresUrl();
  const rows = useStatic ? exportFromStatic() : await exportFromPrisma();

  const exportDir = join(process.cwd(), 'exports');
  mkdirSync(exportDir, { recursive: true });
  const outPath = join(exportDir, 'player-scores-summary.csv');
  writeFileSync(outPath, toCsv([...HEADERS], rows), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${rows.length} row(s) to ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`Source: ${useStatic ? 'static (league-data.json)' : 'Postgres'} — columns: ${HEADERS.join(', ')}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
