/**
 * Verify Postgres/Supabase connectivity and core table counts.
 * Loads `.env` then `.env.local` (same vars as Next.js) if keys are unset.
 *
 * Usage: npm run db:check
 * Or:    DATABASE_URL="postgresql://..." npm run db:check
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(rel: string): void {
  const p = join(process.cwd(), rel);
  if (!existsSync(p)) return;
  const text = readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url || url.length < 10) {
    console.error(
      'Missing DATABASE_URL. Add it to .env.local (see docs/SUPABASE_SETUP.md) or run:\n' +
        '  DATABASE_URL="postgresql://..." npm run db:check'
    );
    process.exit(1);
  }

  const hostHint = (() => {
    try {
      const u = new URL(url.replace(/^postgresql:\/\//, 'http://'));
      return `${u.hostname}${u.port ? ':' + u.port : ''}`;
    } catch {
      return '(could not parse host)';
    }
  })();

  console.log(`Connecting to Postgres at ${hostHint} …`);

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log('Raw query: OK\n');

    const [
      users,
      leagues,
      games,
      draftEvents,
      memberships,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.league.count(),
      prisma.leagueGame.count(),
      prisma.draftEvent.count(),
      prisma.leagueMembership.count(),
    ]);

    console.log('Counts (core league data):');
    console.log(`  User              ${users}`);
    console.log(`  League            ${leagues}`);
    console.log(`  LeagueMembership  ${memberships}`);
    console.log(`  LeagueGame        ${games}`);
    console.log(`  DraftEvent        ${draftEvents}`);

    if (users === 0 && games === 0) {
      console.log(
        '\nNote: DB is reachable but empty. Run seeds or use Wizards to add data.'
      );
    } else {
      console.log('\nData load check: OK (tables readable).');
    }
  } catch (e) {
    console.error('Connection or query failed:');
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
