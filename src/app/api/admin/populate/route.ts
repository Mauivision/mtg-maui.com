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

  // Create one game per group of 4 so all 16 players get scores and appear on the leaderboard
  const pointsByPlace = [15, 8, 4, 1]; // 1st, 2nd, 3rd, 4th
  for (let g = 0; g + 4 <= memberships.length; g += 4) {
    const group = memberships.slice(g, g + 4);
    const playerIds = group.map((m) => m.userId);
    const round = Math.floor(g / 4) + 1;

    const game = await prisma.leagueGame.create({
    data: {
      leagueId,
      gameType: 'commander',
      tournamentPhase: 'swiss',
      round,
      date: new Date(Date.now() + round * 24 * 60 * 60 * 1000),
      recordedBy: group[0].userId,
      players: JSON.stringify(playerIds),
      placements: JSON.stringify(
        group.map((m, i) => ({
          playerId: m.userId,
          playerName: m.user.name,
          place: i + 1,
          points: pointsByPlace[i],
        }))
      ),
    },
  });

    for (let i = 0; i < 4; i++) {
      const membership = group[i];
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
          placement: i + 1,
          points: pointsByPlace[i],
        },
      });
    }
  }

  logger.info('✅ Created sample games with scores');
}