/**
 * Upserts all Commander pods from src/data/league-data.json into the database
 * so DB mode matches static JSON (11 pods, rounds 1–11).
 *
 * - New rounds: inserted with LeagueGame + LeagueGameDeck rows.
 * - Existing rounds (same league + commander + round): placements and notes updated from JSON
 *   so corrected scores replace stale DB rows.
 *
 * Run (with DATABASE_URL):
 *   npx ts-node --project tsconfig.seed.json prisma/sync-commander-games-from-league-json.ts
 *
 * Or: npm run prisma:sync:league-json
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface JsonGame {
  date: string;
  round: number;
  pod: string;
  results: Array<{ playerId: string; place: number; points: number }>;
}

interface LeagueJson {
  league: { name: string };
  players: Array<{ id: string; name: string; commander?: string; active?: boolean }>;
  games: JsonGame[];
}

async function main() {
  const path = join(process.cwd(), 'src', 'data', 'league-data.json');
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw) as LeagueJson;

  const adminPassword = await bcrypt.hash('12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mtg-maui.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@mtg-maui.com', password: adminPassword },
  });

  let league = await prisma.league.findFirst({ where: { name: data.league.name } });
  if (!league) {
    league = await prisma.league.findFirst({ where: { name: 'MTG Maui League' } });
  }
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: data.league.name,
        description: 'Synced from league-data.json',
        format: 'commander',
        startDate: new Date('2026-01-01'),
        status: 'active',
        maxPlayers: 50,
      },
    });
    console.log('Created league:', league.name);
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  const userIdByKey = new Map<string, string>();
  const deckIdByKey = new Map<string, string>();

  for (const p of data.players) {
    const email = `${p.id}@maui-commander.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: p.name },
      create: { name: p.name, email, password: hashedPassword },
    });
    userIdByKey.set(p.id, user.id);

    const membership = await prisma.leagueMembership.upsert({
      where: { leagueId_userId: { leagueId: league!.id, userId: user.id } },
      update: { active: p.active !== false },
      create: { leagueId: league!.id, userId: user.id, active: p.active !== false },
    });

    let deck = await prisma.leagueDeck.findFirst({
      where: { leagueId: league!.id, membershipId: membership.id },
    });
    if (!deck) {
      deck = await prisma.leagueDeck.create({
        data: {
          leagueId: league!.id,
          membershipId: membership.id,
          name: `${p.name}'s Deck`,
          commander: p.commander?.split(' / ')[0] ?? 'Commander',
          colorIdentity: JSON.stringify(['W', 'U', 'B', 'R', 'G']),
          cards: JSON.stringify([]),
        },
      });
    }
    deckIdByKey.set(p.id, deck.id);
  }

  let created = 0;
  let updated = 0;

  for (const g of data.games) {
    const sorted = [...g.results].sort((a, b) => a.place - b.place);
    const playerIds = sorted.map((r) => userIdByKey.get(r.playerId)).filter(Boolean) as string[];
    if (playerIds.length !== sorted.length) {
      console.warn(`Round ${g.round}: missing users for keys`, sorted.map((r) => r.playerId));
      continue;
    }

    const placements = sorted.map((r) => ({
      playerId: userIdByKey.get(r.playerId)!,
      place: r.place,
      points: r.points,
    }));

    const existing = await prisma.leagueGame.findFirst({
      where: {
        leagueId: league!.id,
        gameType: 'commander',
        round: g.round,
      },
    });

    if (existing) {
      await prisma.leagueGameDeck.deleteMany({ where: { gameId: existing.id } });
      await prisma.leagueGame.update({
        where: { id: existing.id },
        data: {
          date: new Date(`${g.date}T12:00:00`),
          players: JSON.stringify(playerIds),
          placements: JSON.stringify(placements),
          notes: `${g.pod} — ${g.date}`,
        },
      });
      for (const r of sorted) {
        const key = r.playerId;
        await prisma.leagueGameDeck.create({
          data: {
            gameId: existing.id,
            deckId: deckIdByKey.get(key)!,
            playerId: userIdByKey.get(key)!,
            placement: r.place,
            points: r.points,
          },
        });
      }
      updated += 1;
      console.log(`Updated round ${g.round} (${g.pod}): VP ${placements.map((p) => p.points).join('/')}`);
      continue;
    }

    const game = await prisma.leagueGame.create({
      data: {
        leagueId: league!.id,
        gameType: 'commander',
        tournamentPhase: 'swiss',
        round: g.round,
        date: new Date(`${g.date}T12:00:00`),
        recordedBy: admin.id,
        players: JSON.stringify(playerIds),
        placements: JSON.stringify(placements),
        notes: `${g.pod} — ${g.date}`,
      },
    });

    for (const r of sorted) {
      const key = r.playerId;
      await prisma.leagueGameDeck.create({
        data: {
          gameId: game.id,
          deckId: deckIdByKey.get(key)!,
          playerId: userIdByKey.get(key)!,
          placement: r.place,
          points: r.points,
        },
      });
    }

    created += 1;
    console.log(`Created round ${g.round} ${g.pod}: VP ${placements.map((p) => p.points).join('/')}`);
  }

  console.log(`\nDone. Created ${created} games, updated ${updated} (from league-data.json).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
