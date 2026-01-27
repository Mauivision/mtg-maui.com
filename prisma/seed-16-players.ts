import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 16 players for MTG Maui League...');

  // Get or create the default league
  let league = await prisma.league.findFirst({
    where: { name: 'MTG Maui League' },
  });

  if (!league) {
    league = await prisma.league.create({
      data: {
        name: 'MTG Maui League',
        description: 'Default league for MTG Maui players',
        format: 'commander',
        startDate: new Date(),
        status: 'active',
        maxPlayers: 50,
      },
    });
    console.log('✅ Created default league');
  }

  // Commander names for each player
  const commanders = [
    "Atraxa, Praetors' Voice",
    'Kess, Dissident Mage',
    "Yuriko, the Tiger's Shadow",
    'Krenko, Mob Boss',
    'Estrid, the Masked',
    'Meren of Clan Nel Toth',
    'Urza, Lord High Artificer',
    'The Ur-Dragon',
    'Aesi, Tyrant of Gyre Strait',
    'Edgar Markov',
    'Kaalia of the Vast',
    'Marath, Will of the Wild',
    'Mizzix of the Izmagnus',
    'Chainer, Dementia Master',
    'Grand Arbiter Augustin IV',
    'Kumena, Tyrant of Orazca',
  ];

  // Create 16 players
  const players = [];
  for (let i = 1; i <= 16; i++) {
    const email = `player${i}@mtg-maui.com`;
    const name = `Player ${i}`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create or update league membership
    const membership = await prisma.leagueMembership.upsert({
      where: {
        leagueId_userId: {
          leagueId: league.id,
          userId: user.id,
        },
      },
      update: { active: true },
      create: {
        leagueId: league.id,
        userId: user.id,
        active: true,
      },
    });

    // Create or update league deck with commander
    // First check if deck exists
    const existingDeck = await prisma.leagueDeck.findFirst({
      where: {
        membershipId: membership.id,
        leagueId: league.id,
      },
    });

    if (existingDeck) {
      await prisma.leagueDeck.update({
        where: { id: existingDeck.id },
        data: {
          commander: commanders[i - 1],
          name: `${name}'s ${commanders[i - 1]} Deck`,
        },
      });
    } else {
      await prisma.leagueDeck.create({
        data: {
          leagueId: league.id,
          membershipId: membership.id,
          name: `${name}'s ${commanders[i - 1]} Deck`,
          commander: commanders[i - 1],
          colorIdentity: JSON.stringify(['W', 'U', 'B', 'R', 'G']),
          cards: JSON.stringify([]),
        },
      });
    }

    players.push({ id: user.id, name, email, commander: commanders[i - 1] });
    console.log(`✅ Created Player ${i}: ${name} (${commanders[i - 1]})`);
  }

  console.log(`\n🎉 Successfully created ${players.length} players!`);
  console.log('\n📋 Player List:');
  players.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} - ${p.commander}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('❌ Error seeding players:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
