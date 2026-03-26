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

type StaticLeagueData = {
  league: { id: string; name?: string };
  players: Array<{ id: string; name: string; commander?: string; active?: boolean }>;
  games: Array<{
    date: string;
    round: number;
    pod: string;
    results: Array<{ playerId: string; place: number; points: number }>;
  }>;
};

const HEADERS = [
  'id',
  'source',
  'league_name',
  'league_id',
  'game_type',
  'date',
  'tournament_phase',
  'round',
  'table_number',
  'notes',
  'player_1_email',
  'player_1_name',
  'player_1_place',
  'player_1_points',
  'player_2_email',
  'player_2_name',
  'player_2_place',
  'player_2_points',
  'player_3_email',
  'player_3_name',
  'player_3_place',
  'player_3_points',
  'player_4_email',
  'player_4_name',
  'player_4_place',
  'player_4_points',
] as const;

function writeOut(rows: Array<Record<string, CsvValue>>) {
  const exportDir = join(process.cwd(), 'exports');
  mkdirSync(exportDir, { recursive: true });
  const csv = toCsv([...HEADERS], rows);
  const outPath = join(exportDir, 'supabase-games-import.csv');
  writeFileSync(outPath, csv, 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${rows.length} row(s) to ${outPath}`);
}

function emailForStaticPlayerId(id: string): string {
  return `${id}@maui-commander.local`;
}

function staticGameRowId(
  leagueId: string,
  date: string,
  round: number,
  pod: string,
  index: number
): string {
  const podKey = String(pod).replace(/[^\w.-]+/g, '_').slice(0, 120);
  return `import-game:static:${leagueId}:${date}:R${round}:${podKey}:i${index}`;
}

function exportFromStatic(): Array<Record<string, CsvValue>> {
  const path = join(process.cwd(), 'src', 'data', 'league-data.json');
  if (!existsSync(path)) {
    throw new Error(`Missing static data at ${path}`);
  }
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw) as StaticLeagueData;
  const leagueId = data.league?.id ?? 'static';
  const leagueName = data.league?.name ?? 'Maui Commander League';
  const playerById = new Map(data.players.map((p) => [p.id, p]));

  const rows: Array<Record<string, CsvValue>> = [];
  let gameIndex = 0;
  for (const g of data.games ?? []) {
    const sorted = [...(g.results ?? [])].sort((a, b) => a.place - b.place).slice(0, 4);
    const base: Record<string, CsvValue> = {
      id: staticGameRowId(leagueId, g.date, g.round, g.pod, gameIndex),
      source: 'static',
      league_name: leagueName,
      league_id: leagueId,
      game_type: 'commander',
      date: g.date,
      tournament_phase: 'swiss',
      round: g.round,
      table_number: null,
      notes: g.pod,
    };

    sorted.forEach((r, idx) => {
      const p = playerById.get(r.playerId);
      const n = idx + 1;
      base[`player_${n}_email`] = p ? emailForStaticPlayerId(p.id) : null;
      base[`player_${n}_name`] = p?.name ?? null;
      base[`player_${n}_place`] = r.place;
      base[`player_${n}_points`] = r.points;
    });

    rows.push(base);
    gameIndex += 1;
  }
  return rows;
}

async function exportFromPrisma(): Promise<Array<Record<string, CsvValue>>> {
  const prisma = new PrismaClient();
  try {
    const leagues = await prisma.league.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    });

    const rows: Array<Record<string, CsvValue>> = [];
    for (const league of leagues) {
      const games = await prisma.leagueGame.findMany({
        where: { leagueId: league.id, gameType: 'commander' },
        select: {
          id: true,
          leagueId: true,
          gameType: true,
          tournamentPhase: true,
          round: true,
          tableNumber: true,
          date: true,
          notes: true,
          placements: true,
          players: true,
        },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      });

      // Preload memberships for email/name lookup
      const memberships = await prisma.leagueMembership.findMany({
        where: { leagueId: league.id },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      const userById = new Map(memberships.map((m) => [m.userId, m.user]));

      for (const g of games) {
        let placements: Array<{ playerId: string; place?: number; points?: number }> = [];
        try {
          placements = JSON.parse(g.placements || '[]') as Array<{
            playerId: string;
            place?: number;
            points?: number;
          }>;
        } catch {
          placements = [];
        }

        const byPlace = placements
          .filter((p) => p && typeof p.playerId === 'string')
          .sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
          .slice(0, 4);

        const base: Record<string, CsvValue> = {
          id: `import-game:pg:${g.id}`,
          source: 'postgres',
          league_name: league.name,
          league_id: league.id,
          game_type: g.gameType,
          date: g.date.toISOString().split('T')[0],
          tournament_phase: g.tournamentPhase ?? 'swiss',
          round: g.round ?? null,
          table_number: g.tableNumber ?? null,
          notes: g.notes ?? null,
        };

        byPlace.forEach((p, idx) => {
          const u = userById.get(p.playerId) ?? null;
          const n = idx + 1;
          base[`player_${n}_email`] = u?.email ?? null;
          base[`player_${n}_name`] = u?.name ?? null;
          base[`player_${n}_place`] = typeof p.place === 'number' ? p.place : null;
          base[`player_${n}_points`] = typeof p.points === 'number' ? p.points : 0;
        });

        rows.push(base);
      }
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

  const forceStatic = process.env.EXPORT_GAMES_SOURCE === 'static';
  const useStatic = forceStatic || !hasPostgresUrl();
  const rows = useStatic ? exportFromStatic() : await exportFromPrisma();
  writeOut(rows);
  // eslint-disable-next-line no-console
  console.log(`Source: ${useStatic ? 'static' : 'Postgres'} (set EXPORT_GAMES_SOURCE=static to force static)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

