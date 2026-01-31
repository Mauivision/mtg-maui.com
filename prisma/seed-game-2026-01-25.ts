/**
 * Seed: Maui Commander League — Pod C game, Jan 25, 2026
 *
 * Run: npm run prisma:seed:game:c
 *
 * Game results:
 * - 1st: Aaron H. (8 VP) — Win, 1 Elim, Heads-Up, 1 Silver (A)
 * - 2nd: James (3 VP) — Heads-Up, 1 Silver (O)
 * - 3rd: Tre (3 VP) — 1 Elim, 1 Silver (I)
 * - 4th: Dan (1 VP) — 1 Silver (V)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLAYERS = [
  { name: 'Aaron H.', emailKey: 'aaronh', deck: 'Yannik / Esper (UBW)', points: 8, place: 1 },
  { name: 'James', emailKey: 'james', deck: 'Kefka / Grixis (UBR)', points: 3, place: 2 },
  { name: 'Tre', emailKey: 'tre', deck: 'Breya / WUBR', points: 3, place: 3 },
  { name: 'Dan', emailKey: 'dan', deck: 'Sofka', points: 1, place: 4 },
] as const;

async function main() {
  console.log('🌱 Seeding Maui Commander League — Pod C, Jan 25, 2026...');

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
          name: `${p.name}'s ${p.deck.split(' / ')[0]} Deck`,
          commander: p.deck.split(' / ')[0],
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
  const dayStart = new Date('2026-01-25T00:00:00');
  const dayEnd = new Date('2026-01-25T23:59:59');
  const existingGame = await prisma.leagueGame.findFirst({
    where: {
      leagueId: league!.id,
      gameType: 'commander',
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (existingGame) {
    console.log('\n⏭️ Game for Jan 25, 2026 already exists. Skipping to avoid duplicate.');
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
      round: 3,
      date: new Date('2026-01-25'),
      recordedBy: admin.id,
      players: JSON.stringify(playerIds),
      placements: JSON.stringify(placements),
      commanderObjectives: JSON.stringify({
        golden: { roll: 3, description: 'Win on turn 6 or before', claimed: false },
        silver: [
          { code: 'V', description: 'First return creature from graveyard', claimedBy: 'Dan' },
          { code: 'O', description: 'First commander on battlefield', claimedBy: 'James' },
          { code: 'A', description: 'First blood', claimedBy: 'Aaron H.' },
          { code: 'I', description: 'Control opponent permanent', claimedBy: 'Tre' },
        ],
      }),
      notes: 'Pod C. Winner: Aaron H. (flying damage). Elim order: Dan, Tre, James.',
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

  console.log('\n🎉 Seeded game: Maui Commander League — Pod C, Jan 25, 2026');
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
