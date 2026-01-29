import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { requireAdminOrSimple } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    logger.info('🌱 Populating MTG Maui League with 16 players...');

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
      logger.info('✅ Created default league');
    }

    // Commander names and player data
    const playerData = [
      { name: 'DragonMaster', commander: 'The Ur-Dragon' },
      { name: 'SpellSlinger', commander: 'Jace, the Mind Sculptor' },
      { name: 'CardShark', commander: 'Thrasios, Triton Hero' },
      { name: 'ManaBurn', commander: 'Chandra, Torch of Defiance' },
      { name: 'ArtifactLord', commander: 'Urza, Lord High Artificer' },
      { name: 'GraveDigger', commander: 'Meren of Clan Nel Toth' },
      { name: 'AngelWings', commander: 'Kaalia of the Vast' },
      { name: 'ZombieKing', commander: 'Chainer, Dementia Master' },
      { name: 'VampireLord', commander: 'Edgar Markov' },
      { name: 'FishKing', commander: 'Aesi, Tyrant of Gyre Strait' },
      { name: 'TreeBeard', commander: 'Marath, Will of the Wild' },
      { name: 'WizardHat', commander: 'Mizzix of the Izmagnus' },
      { name: 'JudgeHammer', commander: 'Grand Arbiter Augustin IV' },
      { name: 'KrakenLord', commander: 'Kumena, Tyrant of Orazca' },
      { name: 'GoblinKing', commander: 'Krenko, Mob Boss' },
      { name: 'MaskMaster', commander: 'Estrid, the Masked' },
    ];

    // Create players and league memberships
    for (let i = 0; i < playerData.length; i++) {
      const player = playerData[i];
      const email = `player${i + 1}@mtg-maui.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create or update user
      const user = await prisma.user.upsert({
        where: { email },
        update: { name: player.name },
        create: {
          name: player.name,
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

      // Create or update league deck
      let deck = await prisma.leagueDeck.findFirst({
        where: { membershipId: membership.id },
      });

      if (deck) {
        deck = await prisma.leagueDeck.update({
          where: { id: deck.id },
          data: {
            commander: player.commander,
            name: `${player.name}'s ${player.commander} Deck`,
          },
        });
      } else {
        deck = await prisma.leagueDeck.create({
          data: {
            leagueId: league.id,
            membershipId: membership.id,
            name: `${player.name}'s ${player.commander} Deck`,
            commander: player.commander,
            colorIdentity: '["W","U","B","R","G"]', // WUBRG for most commanders
            cards: '{}', // Empty deck for now
          },
        });
      }

      logger.info(`✅ Created player: ${player.name}`);
    }

    // Create some sample games with scores
    await createSampleGames(league.id);

    logger.info('🎉 Successfully populated 16 players with sample games!');

    return NextResponse.json({
      success: true,
      message: 'Database populated with 16 players and sample games',
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error populating database', error);
    return handleApiError(error);
  }
}

async function createSampleGames(leagueId: string) {
  logger.info('🎮 Creating sample games...');

  // Get all players with their decks
  const memberships = await prisma.leagueMembership.findMany({
    where: { leagueId, active: true },
    include: { 
      user: true, 
      league: true,
      registeredDecks: true,
    },
  });

  if (memberships.length < 4) {
    logger.warn('Not enough players to create games');
    return;
  }

  const playerIds = memberships.slice(0, 4).map((m) => m.userId);

  // Create a sample tournament game
  const game = await prisma.leagueGame.create({
    data: {
      leagueId,
      gameType: 'commander',
      tournamentPhase: 'swiss',
      round: 1,
      date: new Date(),
      recordedBy: memberships[0].userId,
      players: JSON.stringify(playerIds),
      placements: JSON.stringify([
        {
          playerId: memberships[0].userId,
          playerName: memberships[0].user.name,
          place: 1,
          points: 15, // 1st place + gold objective + 2 silver objectives
          goldObjective: true,
          silverObjectives: 2,
        },
        {
          playerId: memberships[1].userId,
          playerName: memberships[1].user.name,
          place: 2,
          points: 8, // 2nd place + 2 silver objectives
          goldObjective: false,
          silverObjectives: 2,
        },
        {
          playerId: memberships[2].userId,
          playerName: memberships[2].user.name,
          place: 3,
          points: 4, // 3rd place + 1 silver objective
          goldObjective: false,
          silverObjectives: 1,
        },
        {
          playerId: memberships[3].userId,
          playerName: memberships[3].user.name,
          place: 4,
          points: 1, // Participation points only
          goldObjective: false,
          silverObjectives: 0,
        },
      ]),
    },
  });

  // Create game deck records for each participant
  for (let i = 0; i < 4; i++) {
    const membership = memberships[i];
    const placements = JSON.parse(game.placements) as Array<{ place: number; points: number }>;
    const pl = placements[i];
    if (!pl) continue;

    const deck = membership.registeredDecks[0];
    if (!deck) {
      logger.warn(`No deck found for membership ${membership.id}`);
      continue;
    }

    await prisma.leagueGameDeck.create({
      data: {
        gameId: game.id,
        playerId: membership.userId,
        deckId: deck.id,
        placement: pl.place,
        points: pl.points,
      },
    });
  }

  // Create a few more games to give players more points
  for (let round = 2; round <= 3; round++) {
    const shuffledMemberships = [...memberships].sort(() => Math.random() - 0.5).slice(0, 4);
    const roundPlayerIds = shuffledMemberships.map((m) => m.userId);

    const game2 = await prisma.leagueGame.create({
      data: {
        leagueId,
        gameType: 'commander',
        tournamentPhase: 'swiss',
        round,
        date: new Date(Date.now() + round * 24 * 60 * 60 * 1000), // Different days
        recordedBy: shuffledMemberships[0].userId,
        players: JSON.stringify(roundPlayerIds),
        placements: JSON.stringify([
          {
            playerId: shuffledMemberships[0].userId,
            playerName: shuffledMemberships[0].user.name,
            place: 1,
            points: 13,
            goldObjective: true,
            silverObjectives: 1,
          },
          {
            playerId: shuffledMemberships[1].userId,
            playerName: shuffledMemberships[1].user.name,
            place: 2,
            points: 6,
            goldObjective: false,
            silverObjectives: 1,
          },
          {
            playerId: shuffledMemberships[2].userId,
            playerName: shuffledMemberships[2].user.name,
            place: 3,
            points: 3,
            goldObjective: false,
            silverObjectives: 0,
          },
          {
            playerId: shuffledMemberships[3].userId,
            playerName: shuffledMemberships[3].user.name,
            place: 4,
            points: 1,
            goldObjective: false,
            silverObjectives: 0,
          },
        ]),
      },
    });

    for (let i = 0; i < 4; i++) {
      const membership = shuffledMemberships[i];
      const placements = JSON.parse(game2.placements) as Array<{ place: number; points: number }>;
      const pl = placements[i];
      if (!pl) continue;

      const deck = membership.registeredDecks[0];
      if (!deck) {
        logger.warn(`No deck found for membership ${membership.id}`);
        continue;
      }

      await prisma.leagueGameDeck.create({
        data: {
          gameId: game2.id,
          playerId: membership.userId,
          deckId: deck.id,
          placement: pl.place,
          points: pl.points,
        },
      });
    }
  }

  logger.info('✅ Created sample games with scores');
}