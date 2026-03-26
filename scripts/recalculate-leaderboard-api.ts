/**
 * Calls POST /api/admin/leaderboard/recalculate for the first league (dev: SKIP_ADMIN_AUTH=true).
 * Re-applies Prisma scoring rules to game placements (Gold/Silver/Placement rules), then updates LeagueGameDeck + placements JSON.
 *
 * Usage (dev server must be running):
 *   npx ts-node --project tsconfig.seed.json scripts/recalculate-leaderboard-api.ts
 *   BASE_URL=http://localhost:3004 npx ts-node --project tsconfig.seed.json scripts/recalculate-leaderboard-api.ts
 *
 * For Commander VP entered manually per pod, prefer editing games in Wizards or syncing JSON:
 *   npm run prisma:sync:league-json
 */

const BASE = process.env.BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3004';

/** Static-only league id from league-data.json — no Prisma recalculate. */
const STATIC_LEAGUE_IDS = new Set(['maui-commander-static']);

async function main() {
  const leaguesRes = await fetch(`${BASE}/api/leagues`, { cache: 'no-store' });
  const leaguesJson = (await leaguesRes.json()) as {
    leagues?: Array<{ id: string; name: string }>;
    source?: string;
  };
  const leagues = leaguesJson.leagues ?? [];
  if (leaguesJson.source === 'static-json' || leagues.length === 0) {
    console.log(
      'No live database leagues (static JSON mode or empty). Totals come from src/data/league-data.json. Start Postgres + DATABASE_URL, or run: npm run prisma:sync:league-json'
    );
    process.exit(0);
  }
  const leagueId = leagues[0]!.id;
  if (STATIC_LEAGUE_IDS.has(leagueId)) {
    console.log(
      'API is serving the bundled static league. Edit src/data/league-data.json and refresh the site, or set DATABASE_URL and sync: npm run prisma:sync:league-json'
    );
    process.exit(0);
  }
  const name = leagues[0]!.name;
  console.log(`Recalculating scores for league: ${name} (${leagueId}) …`);

  const recalc = await fetch(`${BASE}/api/admin/leaderboard/recalculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leagueId }),
  });
  const body = await recalc.json().catch(() => ({}));
  if (!recalc.ok) {
    console.error('Recalculate failed:', recalc.status, body);
    process.exit(1);
  }
  console.log('OK:', body.message ?? body);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
