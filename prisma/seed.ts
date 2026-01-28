import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = bcrypt.hashSync('12345', 10);

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@mtg-maui.com' },
      update: { name: 'Admin', password: adminPasswordHash },
      create: {
        name: 'Admin',
        email: 'admin@mtg-maui.com',
        password: adminPasswordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: 'player1@example.com' },
      update: {},
      create: {
        name: 'Alice Johnson',
        email: 'player1@example.com',
        password: '$2a$10$rOZ8Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', // hashed password
      },
    }),
    prisma.user.upsert({
      where: { email: 'player2@example.com' },
      update: {},
      create: {
        name: 'Bob Smith',
        email: 'player2@example.com',
        password: '$2a$10$rOZ8Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', // hashed password
      },
    }),
    prisma.user.upsert({
      where: { email: 'player3@example.com' },
      update: {},
      create: {
        name: 'Carol Davis',
        email: 'player3@example.com',
        password: '$2a$10$rOZ8Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', // hashed password
      },
    }),
  ]);

  console.log(
    'Created users:',
    users.map(u => ({ id: u.id, name: u.name, email: u.email }))
  );

  // Create sample cards (Card has no unique on name; use findFirst + create)
  const cardData = [
    { name: 'Lightning Bolt', manaCost: '{R}', cmc: 1, type: 'Instant', text: 'Lightning Bolt deals 3 damage to any target.', power: null, toughness: null, loyalty: null, imageUrl: 'https://cards.scryfall.io/normal/front/c/e/ce711943-c1a1-43a0-8b89-8d169cfb8e06.jpg', setCode: '2x2', setName: 'Double Masters 2022', rarity: 'Common' },
    { name: 'Counterspell', manaCost: '{U}{U}', cmc: 2, type: 'Instant', text: 'Counter target spell.', power: null, toughness: null, loyalty: null, imageUrl: 'https://cards.scryfall.io/normal/front/8/4/8493131c-0a7b-4fd6-a2a7-0bf12f67d382.jpg', setCode: 'mh2', setName: 'Modern Horizons 2', rarity: 'Common' },
    { name: 'Black Lotus', manaCost: '{0}', cmc: 0, type: 'Artifact', text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.', power: null, toughness: null, loyalty: null, imageUrl: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg', setCode: '2ed', setName: 'Unlimited Edition', rarity: 'Rare' },
    { name: 'Serra Angel', manaCost: '{3}{W}{W}', cmc: 5, type: 'Creature - Angel', text: 'Flying, vigilance', power: '4', toughness: '4', loyalty: null, imageUrl: 'https://cards.scryfall.io/normal/front/9/8/9805884b-23e1-4c24-82c6-4b4a697d8234.jpg', setCode: 'dmu', setName: 'Dominaria United', rarity: 'Uncommon' },
  ];
  const cards: { id: string; name: string }[] = [];
  for (const c of cardData) {
    let card = await prisma.card.findFirst({ where: { name: c.name } });
    if (!card) {
      card = await prisma.card.create({
      data: {
        name: c.name,
        manaCost: c.manaCost,
        cmc: c.cmc,
        type: c.type,
        text: c.text,
        power: c.power,
        toughness: c.toughness,
        loyalty: c.loyalty,
        imageUrl: c.imageUrl,
        setCode: c.setCode,
        setName: c.setName,
        rarity: c.rarity,
      },
    });
    }
    cards.push(card);
  }

  console.log(
    'Created cards:',
    cards.map(c => ({ id: c.id, name: c.name }))
  );

  // Create sample decks
  const deck1 = await prisma.deck.create({
    data: {
      name: 'Burn Deck',
      format: 'modern',
      userId: users[1].id,
      cards: {
        create: [
          { cardId: cards[0].id, quantity: 4 }, // Lightning Bolt
          { cardId: cards[3].id, quantity: 4 }, // Serra Angel
        ],
      },
    },
  });

  const deck2 = await prisma.deck.create({
    data: {
      name: 'Control Deck',
      format: 'standard',
      userId: users[2].id,
      cards: {
        create: [
          { cardId: cards[1].id, quantity: 4 }, // Counterspell
          { cardId: cards[3].id, quantity: 3 }, // Serra Angel
        ],
      },
    },
  });

  console.log('Created decks:', [
    { id: deck1.id, name: deck1.name, userId: deck1.userId },
    { id: deck2.id, name: deck2.name, userId: deck2.userId },
  ]);

  // Create sample tournament (endDate required)
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Friday Night Magic',
      format: 'standard',
      startDate: start,
      endDate: end,
      maxPlayers: 16,
      creatorId: users[0].id,
      participants: {
        create: [{ userId: users[1].id }, { userId: users[2].id }, { userId: users[3].id }],
      },
    },
    include: { participants: true },
  });

  console.log('Created tournament:', {
    id: tournament.id,
    name: tournament.name,
    format: tournament.format,
    participants: tournament.participants.length,
  });

  // Create sample matches
  const match1 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      player1Id: users[1].id,
      player2Id: users[2].id,
      winnerId: users[1].id, // Alice wins
      round: 1,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      player1Id: users[2].id,
      player2Id: users[3].id,
      winnerId: users[3].id, // Carol wins
      round: 1,
    },
  });

  console.log('Created matches:', [
    { id: match1.id, players: `${users[1].name} vs ${users[2].name}`, winner: users[1].name },
    { id: match2.id, players: `${users[2].name} vs ${users[3].name}`, winner: users[3].name },
  ]);

  // Create sample newsletter subscriptions (upsert to allow re-seed)
  await Promise.all([
    prisma.newsletterSubscription.upsert({
      where: { email: 'subscriber1@example.com' },
      update: { name: 'Newsletter Subscriber 1', isActive: true },
      create: { email: 'subscriber1@example.com', name: 'Newsletter Subscriber 1' },
    }),
    prisma.newsletterSubscription.upsert({
      where: { email: 'subscriber2@example.com' },
      update: { name: 'Newsletter Subscriber 2', isActive: true },
      create: { email: 'subscriber2@example.com', name: 'Newsletter Subscriber 2' },
    }),
  ]);

  // Create default league if it doesn't exist
  const existingLeague = await prisma.league.findFirst({
    where: {
      name: 'MTG Maui League',
    },
  });

  if (!existingLeague) {
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

    console.log('Created default league:', league.id);

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

    console.log('Created default scoring rules');
  } else {
    console.log('Default league already exists:', existingLeague.id);
  }

  // Default editable page content (Admin can change via Page Content tab)
  const defaultPages: Array<{ path: string; title: string | null; description: string | null; config: string }> = [
    { path: '/', title: 'MTG Maui League', description: "Hawaii's Premier MTG Tournament Platform", config: JSON.stringify({ navLabel: 'Home', heroSubtitle: "Hawaii's Premier MTG League", heroHeadline: 'Enter the Arena', heroTagline: 'Commander. Draft. Real rankings. Real players. The ultimate Magic league experience.', footerBlurb: "Enter the arena. Hawaii's premier Magic: The Gathering league — Commander, Draft, real rankings, real players.", exploreTitle: 'Explore the League', exploreSubtitle: 'Climb the ranks, track your journey, and master the rules.', features: [{ title: 'Leaderboard', desc: 'Track your progress and see how you rank against other players.', href: '/leaderboard', cta: 'View Rankings' }, { title: 'Character Sheets', desc: 'View your D&D-style character progression and achievements.', href: '/character-sheets', cta: 'View Sheets' }, { title: 'Rules', desc: 'Learn about tournament formats, scoring, and house rules.', href: '/rules', cta: 'Read Rules' }] }) },
    { path: '/leaderboard', title: 'League Leaderboard', description: 'Track your progress and see how you stack up. Real-time rankings and comprehensive statistics.', config: JSON.stringify({ navLabel: 'Leaderboard' }) },
    { path: '/bulletin', title: 'Bulletin Board', description: 'News, events, and announcements', config: JSON.stringify({ navLabel: 'Bulletin Board' }) },
    { path: '/rules', title: 'Tournament Rules', description: 'Official rules and scoring', config: JSON.stringify({ navLabel: 'Rules' }) },
    { path: '/commander', title: 'Commander Scoring', description: 'Commander game scoring system', config: JSON.stringify({ navLabel: 'Commander' }) },
    { path: '/character-sheets', title: 'Character Sheets', description: 'D&D-style progression', config: JSON.stringify({ navLabel: 'Character Sheets' }) },
    { path: '/coming-soon', title: 'Coming Soon', description: 'Upcoming features', config: JSON.stringify({ navLabel: 'Coming Soon' }) },
  ];
  for (const p of defaultPages) {
    await prisma.pageContent.upsert({
      where: { path: p.path },
      update: { title: p.title, description: p.description, config: p.config },
      create: { path: p.path, title: p.title, description: p.description, config: p.config },
    });
  }
  console.log('Seeded default page content');

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
