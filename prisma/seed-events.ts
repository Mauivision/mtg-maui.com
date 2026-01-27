import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Chaos Draft events...');

  // Chaos Draft Pack Opening Event - Dec 27th, 2025
  const packOpeningEvent = await prisma.event.upsert({
    where: { id: 'chaos-draft-pack-opening' },
    update: {},
    create: {
      id: 'chaos-draft-pack-opening',
      title: '🎲 Chaos Draft - Pack Opening Day',
      description: `
        **🏰 The Castle Gates Open!**

        Join us for the grand opening of our first Chaos Draft tournament!

        **📦 What to Expect:**
        • 14 booster packs per player
        • Unique draft format with surprise twists
        • Medieval-themed card treatments
        • Special commander restrictions

        **⏰ Schedule:**
        • Registration: 6:00 PM
        • Pack Opening: 6:30 PM
        • Draft Tutorial: 7:00 PM

        **💰 Entry Fee:** $25 (includes all packs and prizes)
        **🏆 Prize Pool:** $500+ in store credit and products

        **🎯 Special Rules:**
        • Commander must be from opened packs
        • No external card borrowing
        • Fun "chaos" elements during games
        • Best sportsmanship award included

        Space is limited to 16 players. Register now to secure your spot!
      `,
      date: new Date('2025-12-27'),
      time: '6:00 PM',
      location: 'MTG Maui League Castle - 123 Magic Lane, Maui, HI',
      maxParticipants: 16,
      status: 'upcoming',
      imageUrl: '/images/events/chaos-draft-pack-opening.jpg',
    },
  });

  // Chaos Draft Tournament Event - Feb 1st, 2026
  const tournamentEvent = await prisma.event.upsert({
    where: { id: 'chaos-draft-tournament' },
    update: {},
    create: {
      id: 'chaos-draft-tournament',
      title: '⚔️ Chaos Draft Tournament - Final Day',
      description: `
        **🏰 The Epic Finale!**

        The Chaos Draft tournament culminates in an epic day of competitive Magic!

        **🎲 Tournament Format:**
        • Single elimination bracket
        • Best of 3 matches
        • Commander decks from draft pools
        • Chaos elements throughout

        **⏰ Schedule:**
        • Player check-in: 9:00 AM
        • Round 1: 10:00 AM
        • Quarterfinals: 12:00 PM
        • Semifinals: 2:00 PM
        • Finals: 4:00 PM
        • Awards: 6:00 PM

        **🏆 Championship Prizes:**
        • 1st Place: $300 store credit + Champion trophy
        • 2nd Place: $150 store credit + Silver medal
        • 3rd Place: $75 store credit + Bronze medal
        • Best Sportsmanship: $50 store credit + Spirit award

        **🎪 Chaos Elements:**
        • Random commander swaps
        • Surprise card additions
        • Time-limited sideboarding
        • Medieval-themed rulings

        Spectators welcome! Food and drinks available.
      `,
      date: new Date('2026-02-01'),
      time: '10:00 AM',
      location: 'MTG Maui League Castle - Main Tournament Hall',
      maxParticipants: 16,
      status: 'upcoming',
      imageUrl: '/images/events/chaos-draft-tournament.jpg',
    },
  });

  // Pre-tournament announcement
  const announcementEvent = await prisma.event.upsert({
    where: { id: 'chaos-draft-announcement' },
    update: {},
    create: {
      id: 'chaos-draft-announcement',
      title: '📢 Chaos Draft Series Announcement',
      description: `
        **🎲 Introducing: Chaos Draft!**

        MTG Maui League is proud to present our first ever **Chaos Draft** tournament series!

        **📅 Important Dates:**
        • Pack Opening: December 27th, 2025
        • Tournament: February 1st, 2026

        **💡 What is Chaos Draft?**
        Chaos Draft combines traditional draft mechanics with unpredictable "chaos" elements that keep every game exciting and unpredictable. Each player opens 14 booster packs and builds a Commander deck, but expect the unexpected!

        **🎯 Unique Features:**
        • Commander must come from your draft pool
        • Surprise chaos effects during games
        • Medieval-themed card treatments
        • Community voting on chaos elements

        **📋 Registration:**
        • Opens: November 1st, 2025
        • Closes: December 20th, 2025
        • Fee: $25 (includes packs and entry)

        Join our Discord for updates and community discussions!

        #ChaosDraft #MTGMaui #CommanderChaos
      `,
      date: new Date('2025-11-01'),
      time: '12:00 PM',
      location: 'MTG Maui League - Online Announcement',
      maxParticipants: 100,
      status: 'upcoming',
      imageUrl: '/images/events/chaos-draft-announcement.jpg',
    },
  });

  // Pre-tournament meetup
  const meetupEvent = await prisma.event.upsert({
    where: { id: 'chaos-draft-meetup' },
    update: {},
    create: {
      id: 'chaos-draft-meetup',
      title: '🤝 Chaos Draft Pre-Tournament Meetup',
      description: `
        **🎪 Meet Your Fellow Chaos Mages!**

        Join us for a casual meetup before the big tournament!

        **📅 When:** January 18th, 2026
        **⏰ Time:** 2:00 PM - 5:00 PM
        **📍 Location:** MTG Maui League Castle

        **🎯 Activities:**
        • Deck building advice sessions
        • Practice games with chaos elements
        • Meet other participants
        • Strategy discussions
        • Q&A with tournament organizers

        **🍕 Food & Fun:**
        • Pizza and snacks provided
        • Casual gaming atmosphere
        • Tournament bracket predictions
        • Community bonding

        **💡 Bring:**
        • Your favorite commander cards
        • Any questions about the format
        • Enthusiasm for chaos!

        This is a great opportunity to practice and make friends before the tournament!
      `,
      date: new Date('2026-01-18'),
      time: '2:00 PM',
      location: 'MTG Maui League Castle - Community Room',
      maxParticipants: 32,
      status: 'upcoming',
      imageUrl: '/images/events/chaos-draft-meetup.jpg',
    },
  });

  console.log('✅ Created Chaos Draft events:');
  console.log(
    '📦 Pack Opening:',
    packOpeningEvent.title,
    'on',
    packOpeningEvent.date.toDateString()
  );
  console.log('⚔️ Tournament:', tournamentEvent.title, 'on', tournamentEvent.date.toDateString());
  console.log(
    '📢 Announcement:',
    announcementEvent.title,
    'on',
    announcementEvent.date.toDateString()
  );
  console.log('🤝 Meetup:', meetupEvent.title, 'on', meetupEvent.date.toDateString());

  console.log('🎲 Chaos Draft events seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding Chaos Draft events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
