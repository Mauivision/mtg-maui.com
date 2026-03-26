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

const SCORE_HEADERS = [
  'id',
  'score_id',
  'score_type',
  'occurred_at',
  'points',
  'placement',
  'league_id',
  'game_id',
  'draft_event_id',
  'draft_match_id',
  'user_id',
  'user_name',
  'user_email',
  'deck_id',
  'deck_name',
  'round',
  'table_number',
  'raw_games_won',
] as const;

function writeScoresCsv(rows: Array<Record<string, CsvValue>>) {
  const exportDir = join(process.cwd(), 'exports');
  mkdirSync(exportDir, { recursive: true });
  const withPk = rows.map((r) => ({
    id: r.score_id,
    ...r,
  }));
  const csv = toCsv([...SCORE_HEADERS], withPk);
  const outPath = join(exportDir, 'scores.csv');
  writeFileSync(outPath, csv, 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${rows.length} row(s) to ${outPath}`);
}

function hasPostgresUrl(): boolean {
  const u = process.env.DATABASE_URL?.trim() ?? '';
  return u.startsWith('postgresql://') || u.startsWith('postgres://');
}

type StaticLeagueData = {
  league: { id: string; name?: string };
  players: Array<{ id: string; name: string; commander?: string }>;
  games: Array<{
    date: string;
    round: number;
    pod: string;
    results: Array<{ playerId: string; place: number; points: number }>;
  }>;
  draftStandings?: { draftName: string; standings: Array<{ name: string; points: number }> };
};

function exportFromStaticLeagueJson(): Array<Record<string, CsvValue>> {
  const path = join(process.cwd(), 'src', 'data', 'league-data.json');
  if (!existsSync(path)) {
    throw new Error(
      `No DATABASE_URL and no static file at ${path}. Either set DATABASE_URL for Postgres export, or add league-data.json for static export.`
    );
  }
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw) as StaticLeagueData;
  const leagueId = data.league?.id ?? 'static';
  const nameByPlayerId = new Map(data.players?.map((p) => [p.id, p.name]) ?? []);

  const rows: Array<Record<string, CsvValue>> = [];

  (data.games ?? []).forEach((g, gameIdx) => {
    const occurred = new Date(g.date).toISOString();
    const gameId = `static-game-${gameIdx}`;
    for (const r of g.results ?? []) {
      const score_id = `static:cmd:${leagueId}:${gameIdx}:${r.playerId}`;
      rows.push({
        score_id,
        score_type: 'commander_game_points',
        occurred_at: occurred,
        points: r.points,
        placement: r.place,
        league_id: leagueId,
        game_id: gameId,
        draft_event_id: null,
        draft_match_id: null,
        user_id: r.playerId,
        user_name: nameByPlayerId.get(r.playerId) ?? null,
        user_email: null,
        deck_id: null,
        deck_name: null,
        round: g.round,
        table_number: null,
        raw_games_won: null,
      });
    }
  });

  const standings = data.draftStandings?.standings ?? [];
  const draftName = data.draftStandings?.draftName ?? 'draft';
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const playerByNormName = new Map<string, { id: string; name: string }>();
  for (const p of data.players ?? []) {
    playerByNormName.set(norm(p.name), { id: p.id, name: p.name });
  }

  standings.forEach((s, i) => {
    const match = playerByNormName.get(norm(s.name));
    const score_id = `static:draft:${norm(draftName)}:${i}:${norm(s.name)}`;
    rows.push({
      score_id,
      score_type: 'draft_standing_points',
      occurred_at: null,
      points: Number(s.points) || 0,
      placement: i + 1,
      league_id: leagueId,
      game_id: null,
      draft_event_id: null,
      draft_match_id: null,
      user_id: match?.id ?? null,
      user_name: s.name.trim(),
      user_email: null,
      deck_id: null,
      deck_name: null,
      round: null,
      table_number: null,
      raw_games_won: null,
    });
  });

  return rows;
}

async function exportFromPrisma(): Promise<Array<Record<string, CsvValue>>> {
  const prisma = new PrismaClient();
  const rows: Array<Record<string, CsvValue>> = [];
  try {
    // Commander scoring: one row per LeagueGameDeck (player points in a LeagueGame).
    const commander = await prisma.leagueGameDeck.findMany({
      include: {
        game: { select: { id: true, leagueId: true, gameType: true, date: true, round: true, tableNumber: true } },
        deck: {
          select: {
            id: true,
            name: true,
            membership: { select: { user: { select: { id: true, name: true, email: true } } } },
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    for (const r of commander) {
      if (r.game?.gameType !== 'commander') continue;
      const u = r.deck?.membership?.user ?? null;
      rows.push({
        score_id: r.id,
        score_type: 'commander_game_points',
        occurred_at: r.game?.date?.toISOString?.() ?? null,
        points: r.points,
        placement: r.placement,
        league_id: r.game?.leagueId ?? null,
        game_id: r.gameId,
        draft_event_id: null,
        draft_match_id: null,
        user_id: u?.id ?? r.playerId,
        user_name: u?.name ?? null,
        user_email: u?.email ?? null,
        deck_id: r.deckId,
        deck_name: r.deck?.name ?? null,
        round: r.game?.round ?? null,
        table_number: r.game?.tableNumber ?? null,
        raw_games_won: null,
      });
    }

    // Draft scoring: 3 points per match win (based on gamesWon1 vs gamesWon2).
    const draftMatches = await prisma.draftMatch.findMany({
      include: {
        draftEvent: { select: { id: true, name: true, date: true } },
        participant1: { include: { user: { select: { id: true, name: true, email: true } } } },
        participant2: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    for (const m of draftMatches) {
      const p1 = m.participant1?.user;
      const p2 = m.participant2?.user;
      const occurredAt = (m.draftEvent?.date ?? m.createdAt).toISOString();
      const winner =
        m.gamesWon1 === m.gamesWon2 ? null : m.gamesWon1 > m.gamesWon2 ? 'p1' : 'p2';

      const p1Points = winner === 'p1' ? 3 : 0;
      const p2Points = winner === 'p2' ? 3 : 0;

      rows.push({
        score_id: `draftmatch:${m.id}:p1`,
        score_type: 'draft_match_points',
        occurred_at: occurredAt,
        points: p1Points,
        placement: null,
        league_id: null,
        game_id: null,
        draft_event_id: m.draftEventId,
        draft_match_id: m.id,
        user_id: p1?.id ?? null,
        user_name: p1?.name ?? null,
        user_email: p1?.email ?? null,
        deck_id: null,
        deck_name: null,
        round: m.round,
        table_number: null,
        raw_games_won: m.gamesWon1,
      });

      rows.push({
        score_id: `draftmatch:${m.id}:p2`,
        score_type: 'draft_match_points',
        occurred_at: occurredAt,
        points: p2Points,
        placement: null,
        league_id: null,
        game_id: null,
        draft_event_id: m.draftEventId,
        draft_match_id: m.id,
        user_id: p2?.id ?? null,
        user_name: p2?.name ?? null,
        user_email: p2?.email ?? null,
        deck_id: null,
        deck_name: null,
        round: m.round,
        table_number: null,
        raw_games_won: m.gamesWon2,
      });
    }

    return rows;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  // Prisma does not auto-load .env for ts-node scripts in this repo.
  loadEnvFile('.env');
  loadEnvFile('.env.local');
  loadEnvFile('.env.development.local');
  loadEnvFile('.env.production.local');

  // Prefer Postgres whenever DATABASE_URL points at Postgres (canonical data).
  // Force JSON: EXPORT_SCORES_SOURCE=static npm run export:scores
  const forceStatic = process.env.EXPORT_SCORES_SOURCE === 'static';
  const useStatic = forceStatic || !hasPostgresUrl();

  if (useStatic) {
    const rows = exportFromStaticLeagueJson();
    writeScoresCsv(rows);
    // eslint-disable-next-line no-console
    console.log('Source: static (src/data/league-data.json)');
    return;
  }

  const rows = await exportFromPrisma();
  writeScoresCsv(rows);
  // eslint-disable-next-line no-console
  console.log('Source: Postgres (DATABASE_URL)');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

