/**
 * Unified seed: Maui Commander League — All 16 players + Pods A–D (Jan 2026)
 *
 * Run: npm run prisma:seed:maui
 *
 * Creates league, all players, and all 4 games in one run.
 * Use this to get leaderboard and character sheets displaying correctly.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LEAGUE_NAME = 'Maui Commander League';

interface PlayerInput {
  name: string;
  emailKey: string;
  deck: string;
}

const ALL_PLAYERS: Record<string, PlayerInput> = {
  april: { name: 'April', emailKey: 'april', deck: 'Loica Cole / UB' },
  kaipo: { name: 'Kaipo', emailKey: 'kaipo', deck: 'Spectacular Spider-Man / Tormod (WB)' },
  ronnie: { name: 'Ronnie', emailKey: 'ronnie', deck: 'Toph / Arcanis (UG)' },
  kevin: { name: 'Kevin', emailKey: 'kevin', deck: 'Infinite Guideline Station (WUUBRG)' },
  kendra: { name: 'Kendra', emailKey: 'kendra', deck: 'Commander Deck' },
  aarons: { name: 'Aaron S.', emailKey: 'aarons', deck: 'Commander Deck' },
  aaronv: { name: 'Aaron V.', emailKey: 'aaronv', deck: 'Commander Deck' },
  zach: { name: 'Zach', emailKey: 'zach', deck: 'Commander Deck' },
  aaronh: { name: 'Aaron H.', emailKey: 'aaronh', deck: 'Yannik / Esper (UBW)' },
  james: { name: 'James', emailKey: 'james', deck: 'Kefka / Grixis (UBR)' },
  tre: { name: 'Tre', emailKey: 'tre', deck: 'Breya / WUBR' },
  dan: { name: 'Dan', emailKey: 'dan', deck: 'Sofka' },
  nate: { name: 'Nate', emailKey: 'nate', deck: 'Diamond Weapon / BG' },
  scott: { name: 'Scott', emailKey: 'scott', deck: 'Jodah / 5R' },
  travis: { name: 'Travis', emailKey: 'travis', deck: 'Soda / Iona RW' },
  dustin: { name: 'Dustin', emailKey: 'dustin', deck: '5pidey / Tobran FR' },
};

const GAMES = [
  { date: '2026-01-05', round: 1, pod: 'A', players: ['april', 'ronnie', 'kaipo', 'kevin'], placements: [9, 1, 4, 1] },
  { date: '2026-01-10', round: 2, pod: 'B', players: ['kendra', 'aarons', 'aaronv', 'zach'], placements: [14, 3, 2, 1] },
  { date: '2026-01-25', round: 3, pod: 'C', players: ['aaronh', 'james', 'tre', 'dan'], placements: [8, 3, 3, 1] },
  { date: '2026-01-30', round: 4, pod: 'D', players: ['nate', 'scott', 'travis', 'dustin'], placements: [7, 3, 3, 1] },
];

async function main() {
  console.log('🌱 Maui Commander League — Full seed (16 players, 4 pods)...\n');

  const adminPassword = await bcrypt.hash('12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mtg-maui.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@mtg-maui.com', password: adminPassword },
  });

  let league = await prisma.league.findFirst({ where: { name: LEAGUE_NAME } });
  if (!league) {
    league = await prisma.league.findFirst({ where: { name: 'MTG Maui League' } });
  }
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: LEAGUE_NAME,
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

  const userIdByKey = new Map<string, string>();
  const deckIdByKey = new Map<string, string>();
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const [key, p] of Object.entries(ALL_PLAYERS)) {
    const email = `${p.emailKey}@maui-commander.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: p.name },
      create: { name: p.name, email, password: hashedPassword },
    });
    userIdByKey.set(key, user.id);

    const membership = await prisma.leagueMembership.upsert({
      where: { leagueId_userId: { leagueId: league!.id, userId: user.id } },
      update: { active: true },
      create: { leagueId: league!.id, userId: user.id, active: true },
    });

    let deck = await prisma.leagueDeck.findFirst({
      where: { leagueId: league!.id, membershipId: membership.id },
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
    deckIdByKey.set(key, deck.id);
  }
  console.log(`✅ Created/found ${Object.keys(ALL_PLAYERS).length} players\n`);

  for (const g of GAMES) {
    const dayStart = new Date(`${g.date}T00:00:00`);
    const dayEnd = new Date(`${g.date}T23:59:59`);
    const existing = await prisma.leagueGame.findFirst({
      where: { leagueId: league!.id, gameType: 'commander', date: { gte: dayStart, lte: dayEnd } },
    });
    if (existing) {
      console.log(`⏭️ Pod ${g.pod} (${g.date}) exists, skipping`);
      continue;
    }

    const playerIds = g.players.map((k) => userIdByKey.get(k)!);
    const placements = g.players.map((key, i) => ({
      playerId: userIdByKey.get(key)!,
      place: i + 1,
      points: g.placements[i],
    }));

    const game = await prisma.leagueGame.create({
      data: {
        leagueId: league!.id,
        gameType: 'commander',
        tournamentPhase: 'swiss',
        round: g.round,
        date: new Date(g.date),
        recordedBy: admin.id,
        players: JSON.stringify(playerIds),
        placements: JSON.stringify(placements),
        notes: `Pod ${g.pod}, ${g.date}`,
      },
    });

    for (let i = 0; i < g.players.length; i++) {
      const key = g.players[i];
      await prisma.leagueGameDeck.create({
        data: {
          gameId: game.id,
          deckId: deckIdByKey.get(key)!,
          playerId: userIdByKey.get(key)!,
          placement: i + 1,
          points: g.placements[i],
        },
      });
    }
    console.log(`✅ Pod ${g.pod} (${g.date}): ${placements.map((p) => p.points).join(' / ')} VP`);
  }

  console.log('\n🎉 Done. Leaderboard and character sheets will show all 16 players.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
