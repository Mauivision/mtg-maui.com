import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding default league...');

  // Check if default league already exists
  const existingLeague = await prisma.league.findFirst({
    where: {
      name: 'MTG Maui League',
    },
  });

  if (existingLeague) {
    console.log('✅ Default league already exists:', existingLeague.id);
    return existingLeague;
  }

  // Create default league
  const league = await prisma.league.create({
    data: {
      name: 'MTG Maui League',
      description: 'Default league for MTG Maui players',
      format: 'commander',
      startDate: new Date(),
      status: 'active',
      maxPlayers: 50,
    },
  });

  console.log('✅ Created default league:', league.id);

  // Create default scoring rules for Commander
  const commanderRules = [
    { name: 'Gold Objective', points: 5, description: 'Complete the gold objective' },
    { name: 'Silver Objective', points: 2, description: 'Complete a silver objective' },
    { name: 'Placement 1st', points: 0, description: 'First place bonus' },
    { name: 'Placement 2nd', points: 1, description: 'Second place bonus' },
    { name: 'Placement 3rd', points: 1, description: 'Third place bonus' },
    { name: 'Placement 4th', points: 1, description: 'Fourth place bonus' },
  ];

  for (const rule of commanderRules) {
    await prisma.scoringRule.create({
      data: {
        leagueId: league.id,
        gameType: 'commander',
        name: rule.name,
        points: rule.points,
        description: rule.description,
        active: true,
      },
    });
  }

  // Create default scoring rules for Draft
  const draftRules = [
    { name: 'Winner', points: 3, description: 'Win the match' },
    { name: 'Participation', points: 1, description: 'Participate in the match' },
  ];

  for (const rule of draftRules) {
    await prisma.scoringRule.create({
      data: {
        leagueId: league.id,
        gameType: 'draft',
        name: rule.name,
        points: rule.points,
        description: rule.description,
        active: true,
      },
    });
  }

  console.log('✅ Created default scoring rules');

  console.log('🎉 Default league seeding complete!');
  return league;
}

main()
  .catch(e => {
    console.error('❌ Error seeding default league:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
