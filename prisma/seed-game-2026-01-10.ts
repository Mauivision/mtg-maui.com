/**
 * Seed: Maui Commander League — Pod B game, Jan 10, 2026
 *
 * Run: npm run prisma:seed:game:b
 *
 * Game results:
 * - 1st: Kendra (14 VP) — Win, 2 Elims, 1 Silver, Heads-Up
 * - 2nd: Aaron S. (3 VP) — 1 Elim, Heads-Up
 * - 3rd: Aaron V. (2 VP) — 2 Silvers
 * - 4th: Zach (1 VP) — 1 Silver
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLAYERS = [
  { name: 'Kendra', emailKey: 'kendra', deck: 'Commander Deck', points: 14, place: 1 },
  { name: 'Aaron S.', emailKey: 'aarons', deck: 'Commander Deck', points: 3, place: 2 },
  { name: 'Aaron V.', emailKey: 'aaronv', deck: 'Commander Deck', points: 2, place: 3 },
  { name: 'Zach', emailKey: 'zach', deck: 'Commander Deck', points: 1, place: 4 },
] as const;

async function main() {
  console.log('🌱 Seeding Maui Commander League — Pod B, Jan 10, 2026...');

  // Get or create admin for recordedBy
  const adminPassword = await bcrypt.hash('12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mtg-maui.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@mtg-maui.com',
      password: adminPassword,
    },
  });

  // Get or create league
  let league = await prisma.league.findFirst({
    where: { name: 'Maui Commander League' },
  });
  if (!league) {
    league = await prisma.league.findFirst({
      where: { name: 'MTG Maui League' },
    });
  }
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: 'Maui Commander League',
        description: 'Maui Commander League — Pod Score Sheet',
        format: 'commander',
        startDate: new Date('2026-01-01'),
        status: 'active',
        maxPlayers: 50,
      },
    });
    console.log('✅ Created league:', league.name);
  } else {
    console.log('✅ Using league:', league.name);
  }

  // Create or find players and their memberships/decks
  const playerRecords: Array<{ userId: string; deckId: string; place: number; points: number }> = [];

  for (const p of PLAYERS) {
    const email = `${p.emailKey}@maui-commander.local`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: p.name },
      create: {
        name: p.name,
        email,
        password: hashedPassword,
      },
    });

    const membership = await prisma.leagueMembership.upsert({
      where: {
        leagueId_userId: {
          leagueId: league!.id,
          userId: user.id,
        },
      },
      update: { active: true },
      create: {
        leagueId: league!.id,
        userId: user.id,
        active: true,
      },
    });

    let deck = await prisma.leagueDeck.findFirst({
      where: {
        leagueId: league!.id,
        membershipId: membership.id,
      },
    });
    if (!deck) {
      deck = await prisma.leagueDeck.create({
        data: {
          leagueId: league!.id,
          membershipId: membership.id,
          name: `${p.name}'s Deck`,
          commander: p.deck,
          colorIdentity: JSON.stringify(['W', 'U', 'B', 'R', 'G']),
          cards: JSON.stringify([]),
        },
      });
    }

    playerRecords.push({
      userId: user.id,
      deckId: deck.id,
      place: p.place,
      points: p.points,
    });
    console.log(`  ✅ ${p.name}: ${p.points} VP (place ${p.place})`);
  }

  // Check if this game already exists (by date + league)
  const dayStart = new Date('2026-01-10T00:00:00');
  const dayEnd = new Date('2026-01-10T23:59:59');
  const existingGame = await prisma.leagueGame.findFirst({
    where: {
      leagueId: league!.id,
      gameType: 'commander',
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (existingGame) {
    console.log('\n⏭️ Game for Jan 10, 2026 already exists. Skipping to avoid duplicate.');
    return;
  }

  // Create the game
  const playerIds = playerRecords.map((r) => r.userId);
  const placements = playerRecords.map((r) => ({
    playerId: r.userId,
    place: r.place,
    points: r.points,
  }));

  const game = await prisma.leagueGame.create({
    data: {
      leagueId: league!.id,
      gameType: 'commander',
      tournamentPhase: 'swiss',
      round: 2,
      date: new Date('2026-01-10'),
      recordedBy: admin.id,
      players: JSON.stringify(playerIds),
      placements: JSON.stringify(placements),
      commanderObjectives: JSON.stringify({
        kendra: { win: true, elims: 2, silver: 1, headsUp: true, vp: 14 },
        aaronS: { elim: 1, headsUp: true, vp: 3 },
        aaronV: { silvers: 2, vp: 2 },
        zach: { silver: 1, vp: 1 },
      }),
      notes: 'Pod B. Winner: Kendra. 2 Elims, 1 Silver, Heads-Up. Aaron S.: 1 Elim, Heads-Up. Aaron V.: 2 Silvers. Zach: 1 Silver.',
    },
  });

  // Create LeagueGameDeck entries for compatibility with other APIs
  for (const r of playerRecords) {
    await prisma.leagueGameDeck.create({
      data: {
        gameId: game.id,
        deckId: r.deckId,
        playerId: r.userId,
        placement: r.place,
        points: r.points,
      },
    });
  }

  console.log('\n🎉 Seeded game: Maui Commander League — Pod B, Jan 10, 2026');
  console.log('   Leaderboard will update after refresh.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
