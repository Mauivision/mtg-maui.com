import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const playerId = params.playerId;

    // Get player basic info
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const gameStats = await prisma.$queryRaw<
      Array<{
        totalGames: number;
        wins: number;
        losses: number;
        totalPoints: number;
        avgPlacement: number;
      }>
    >(Prisma.sql`
      SELECT
        COUNT(*) as totalGames,
        SUM(CASE WHEN placement = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN placement > 1 THEN 1 ELSE 0 END) as losses,
        SUM(points) as totalPoints,
        AVG(placement) as avgPlacement
      FROM LeagueGameDeck
      WHERE playerId = ${playerId}
    `);

    // Get recent games - using gameDecks since LeagueGameParticipant doesn't exist
    const recentGamesData = await prisma.leagueGameDeck.findMany({
      where: { playerId },
      include: {
        game: {
          include: {
            gameDecks: {
              include: {
                deck: {
                  select: {
                    commander: true,
                  },
                },
              },
            },
          },
        },
        deck: {
          select: {
            commander: true,
          },
        },
      },
      orderBy: { game: { date: 'desc' } },
      take: 10,
    });

    // Calculate performance metrics
    const commanderPerformance = await prisma.$queryRaw<
      Array<{
        knockoutRate: number;
        lastTwoStandingRate: number;
      }>
    >(Prisma.sql`
      SELECT
        0.0 as knockoutRate,
        AVG(CASE WHEN lgd.placement <= 2 THEN 1.0 ELSE 0.0 END) * 100 as lastTwoStandingRate
      FROM LeagueGameDeck lgd
      JOIN LeagueGame lg ON lgd.gameId = lg.id
      WHERE lgd.playerId = ${playerId} AND lg.gameType = 'commander'
    `);

    // Get current rank
    const rankResult = await prisma.$queryRaw<Array<{ rank: number }>>(
      Prisma.sql`
        WITH PlayerPoints AS (
          SELECT u.id, SUM(COALESCE(lgd.points, 0)) as totalPoints, COUNT(lgd.id) as gamesPlayed
          FROM User u
          LEFT JOIN LeagueGameDeck lgd ON u.id = lgd.playerId
          GROUP BY u.id
        )
        SELECT COUNT(*) + 1 as rank
        FROM PlayerPoints pp1
        WHERE (pp1.totalPoints > (SELECT totalPoints FROM PlayerPoints WHERE id = ${playerId}))
           OR (pp1.totalPoints = (SELECT totalPoints FROM PlayerPoints WHERE id = ${playerId})
               AND pp1.gamesPlayed > (SELECT gamesPlayed FROM PlayerPoints WHERE id = ${playerId}))
      `
    );

    // Mock achievements (would be stored in database)
    const achievements = [
      {
        id: '1',
        name: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        unlockedAt: new Date().toISOString(),
        rarity: 'common' as const,
      },
      {
        id: '2',
        name: 'Commander Master',
        description: 'Win 10 Commander games',
        icon: '⚔️',
        unlockedAt: new Date().toISOString(),
        rarity: 'epic' as const,
      },
      {
        id: '3',
        name: 'Streak Champion',
        description: 'Achieve a 5-game win streak',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        rarity: 'rare' as const,
      },
    ];

    const stats = gameStats[0];
    const winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;

    // Calculate streaks from recent games (ordered by date desc)
    const allPlayerGames = await prisma.leagueGameDeck.findMany({
      where: { playerId },
      include: {
        game: {
          select: {
            date: true,
          },
        },
      },
      orderBy: { game: { date: 'desc' } },
    });

    // Calculate current streak (consecutive wins from most recent)
    let currentStreak = 0;
    for (const game of allPlayerGames) {
      if (game.placement === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const game of allPlayerGames.reverse()) {
      if (game.placement === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const commanderStats = await prisma.$queryRaw<
      Array<{ commander: string; gamesPlayed: number; wins: number }>
    >(Prisma.sql`
      SELECT lgd.deckId, ld.commander, COUNT(*) as gamesPlayed,
        SUM(CASE WHEN lgd.placement = 1 THEN 1 ELSE 0 END) as wins
      FROM LeagueGameDeck lgd
      JOIN LeagueDeck ld ON lgd.deckId = ld.id
      WHERE lgd.playerId = ${playerId} AND ld.commander IS NOT NULL AND ld.commander != ''
      GROUP BY lgd.deckId, ld.commander
      ORDER BY gamesPlayed DESC, wins DESC
      LIMIT 1
    `);

    const favoriteCommander = commanderStats[0]?.commander ?? null;

    const gameDurations = await prisma.$queryRaw<Array<{ avgDuration: number }>>(
      Prisma.sql`
        SELECT AVG(lg.duration) as avgDuration
        FROM LeagueGame lg
        JOIN LeagueGameDeck lgd ON lg.id = lgd.gameId
        WHERE lgd.playerId = ${playerId} AND lg.duration IS NOT NULL
      `
    );
    const avgDuration = gameDurations[0]?.avgDuration
      ? Math.round(gameDurations[0].avgDuration)
      : null;

    const playerProfile = {
      id: player.id,
      name: player.name,
      email: player.email,
      joinDate: new Date().toISOString(), // User model doesn't have createdAt
      totalGames: stats.totalGames,
      wins: stats.wins,
      losses: stats.losses,
      winRate,
      points: stats.totalPoints,
      rank: rankResult[0]?.rank || 999,
      currentStreak,
      bestStreak,
      favoriteCommander,
      achievements,
      recentGames: recentGamesData.map(game => {
        // Get opponents from the same game
        const opponents = game.game.gameDecks
          .filter(gd => gd.playerId !== playerId)
          .map(gd => gd.deck?.commander || 'Unknown');

        return {
          id: game.gameId,
          gameType: game.game.gameType,
          placement: game.placement,
          points: game.points,
          commander: game.deck?.commander || null,
          opponents,
          date: game.game.date.toISOString(),
          duration: game.game.duration || avgDuration || null,
        };
      }),
      performance: {
        avgPlacement: stats.avgPlacement || 0,
        knockoutRate: commanderPerformance[0]?.knockoutRate || 0,
        lastTwoStandingRate: commanderPerformance[0]?.lastTwoStandingRate || 0,
        consistency: winRate, // Simplified
      },
    };

    return NextResponse.json(playerProfile);
  } catch (error) {
    logger.error('Player profile API error', error);
    return handleApiError(error);
  }
}
