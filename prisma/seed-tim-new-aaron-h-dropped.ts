/**
 * Seed: Add Tim as new league player, mark Aaron H as dropped from league.
 *
 * Run: npx ts-node --project tsconfig.seed.json prisma/seed-tim-new-aaron-h-dropped.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating league: add Tim (new player), mark Aaron H as dropped...');

  let league = await prisma.league.findFirst({
    where: { name: 'Maui Commander League' },
  });
  if (!league) {
    league = await prisma.league.findFirst({
      where: { name: 'MTG Maui League' },
    });
  }
  if (!league) {
    console.error('No league found. Create Maui Commander League first.');
    process.exit(1);
  }

  // Add Tim as new player (find or create user + membership + deck)
  let timUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'tim@maui-commander.local' },
        { name: { equals: 'Tim', mode: 'insensitive' } },
      ],
    },
  });
  if (!timUser) {
    timUser = await prisma.user.create({
      data: {
        name: 'Tim',
        email: 'tim@maui-commander.local',
        password: await bcrypt.hash('password123', 10),
      },
    });
    console.log('  Created user: Tim');
  }

  let timMembership = await prisma.leagueMembership.findUnique({
    where: {
      leagueId_userId: { leagueId: league.id, userId: timUser.id },
    },
  });
  if (!timMembership) {
    timMembership = await prisma.leagueMembership.create({
      data: {
        leagueId: league.id,
        userId: timUser.id,
        active: true,
      },
    });
    console.log('  Added Tim to league (new player)');

    const existingDeck = await prisma.leagueDeck.findFirst({
      where: {
        leagueId: league.id,
        membershipId: timMembership.id,
      },
    });
    if (!existingDeck) {
      await prisma.leagueDeck.create({
        data: {
          leagueId: league.id,
          membershipId: timMembership.id,
          name: "Tim's Deck",
          commander: null,
          colorIdentity: JSON.stringify([]),
          cards: JSON.stringify([]),
        },
      });
      console.log('  Created deck for Tim');
    }
  } else {
    console.log('  Tim already in league');
  }

  // Mark Aaron H as dropped (set membership active = false)
  const membershipsInLeague = await prisma.leagueMembership.findMany({
    where: { leagueId: league.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const aaronHMembership = membershipsInLeague.find(
    m =>
      (m.user.name && /aaron\s*h\.?/i.test(m.user.name)) ||
      (m.user.email && /aaron\.?h|aaronh/i.test(m.user.email))
  );

  if (aaronHMembership) {
    if (aaronHMembership.active) {
      await prisma.leagueMembership.update({
        where: { id: aaronHMembership.id },
        data: { active: false },
      });
      console.log(`  Marked ${aaronHMembership.user.name || aaronHMembership.user.email} (Aaron H) as dropped from league`);
    } else {
      console.log('  Aaron H already marked as dropped');
    }
  } else {
    console.log('  No "Aaron H" found in this league to mark as dropped');
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
