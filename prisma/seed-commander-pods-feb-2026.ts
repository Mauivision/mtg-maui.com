/**
 * Seed: Commander pods — Pod 1–4 (Feb 16 & Feb 22, 2026)
 *
 * Run: npx ts-node --project tsconfig.seed.json prisma/seed-commander-pods-feb-2026.ts
 *
 * Pod A (Feb 22) — 2nd commander game: Ronnie (12), Nate (2), Tre (2), Aaron V (1)
 * Pod B (Feb 22): Dan (15), Kaipo (1), Dustin (0), Kendra (0)
 * Pod C (Feb 16): James (6), April (2), Scott (2), Aaron S (0)
 * Pod D (Feb 16) — 2nd commander game: Kevin (7), Travis (2), Zach (1), Tim (1)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PODS: Array<{
  name: string;
  date: string;
  players: Array<{ name: string; points: number }>;
}> = [
  {
    name: 'Pod A (Feb 22)',
    date: '2026-02-22',
    players: [
      { name: 'Ronnie', points: 12 },
      { name: 'Nate', points: 2 },
      { name: 'Tre', points: 2 },
      { name: 'Aaron V', points: 1 },
    ],
  },
  {
    name: 'Pod B (Feb 22)',
    date: '2026-02-22',
    players: [
      { name: 'Dan', points: 15 },
      { name: 'Kaipo', points: 1 },
      { name: 'Dustin', points: 0 },
      { name: 'Kendra', points: 0 },
    ],
  },
  {
    name: 'Pod C (Feb 16)',
    date: '2026-02-16',
    players: [
      { name: 'James', points: 6 },
      { name: 'April', points: 2 },
      { name: 'Scott', points: 2 },
      { name: 'Aaron S', points: 0 },
    ],
  },
  {
    name: 'Pod D (Feb 16)',
    date: '2026-02-16',
    players: [
      { name: 'Kevin', points: 7 },
      { name: 'Travis', points: 2 },
      { name: 'Zach', points: 1 },
      { name: 'Tim', points: 1 },
    ],
  },
];

function emailForName(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  return `${base}@maui-commander.local`;
}

async function findOrCreateUser(name: string): Promise<{ id: string }> {
  const email = emailForName(name);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { name: { equals: name, mode: 'insensitive' } }],
    },
  });
  if (existing) return { id: existing.id };
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return { id: user.id };
}

async function main() {
  console.log('Seeding Commander pods (Feb 2026)...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mtg-maui.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@mtg-maui.com',
      password: await bcrypt.hash('12345', 10),
    },
  });

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
        description: 'Maui Commander League',
        format: 'commander',
        startDate: new Date('2026-01-01'),
        status: 'active',
        maxPlayers: 50,
      },
    });
  }

  for (const pod of PODS) {
    const dayStart = new Date(`${pod.date}T00:00:00`);
    const dayEnd = new Date(`${pod.date}T23:59:59`);
    const existing = await prisma.leagueGame.findFirst({
      where: {
        leagueId: league!.id,
        gameType: 'commander',
        notes: pod.name,
        date: { gte: dayStart, lte: dayEnd },
      },
    });
    if (existing) {
      console.log(`Skip (exists): ${pod.name}`);
      continue;
    }

    const sorted = [...pod.players].sort((a, b) => b.points - a.points);
    const playerRecords: Array<{ userId: string; deckId: string; place: number; points: number }> = [];

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i]!;
      const user = await findOrCreateUser(p.name);
      const membership = await prisma.leagueMembership.upsert({
        where: {
          leagueId_userId: { leagueId: league!.id, userId: user.id },
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
            commander: null,
            colorIdentity: JSON.stringify([]),
            cards: JSON.stringify([]),
          },
        });
      }

      playerRecords.push({
        userId: user.id,
        deckId: deck.id,
        place: i + 1,
        points: p.points,
      });
    }

    const playerIds = playerRecords.map(r => r.userId);
    const placements = playerRecords.map(r => ({
      playerId: r.userId,
      place: r.place,
      points: r.points,
    }));

    const game = await prisma.leagueGame.create({
      data: {
        leagueId: league!.id,
        gameType: 'commander',
        date: new Date(pod.date),
        recordedBy: admin.id,
        players: JSON.stringify(playerIds),
        placements: JSON.stringify(placements),
        notes: pod.name,
      },
    });

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

    console.log(`  Added: ${pod.name}`);
  }

  console.log('Done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
