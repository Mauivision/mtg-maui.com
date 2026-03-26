import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode, getStaticCharacterSheets } from '@/lib/static-league-data';

function parseJson<T>(raw: string | unknown, fallback: T): T {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return (raw as T) ?? fallback;
}

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;
    const { searchParams } = new URL(request.url);
    const gameTypeParam = searchParams.get('gameType');
    /** Default commander-only so totals match pod VP (e.g. 14 for Kendra’s first game) and not double-count draft LeagueGames. Use gameType=all for every type. */
    const gameTypeWhere =
      gameTypeParam === 'all'
        ? {}
        : gameTypeParam === 'draft' ||
            gameTypeParam === 'commander' ||
            gameTypeParam === 'standard'
          ? { gameType: gameTypeParam }
          : { gameType: 'commander' as const };

    if (isStaticLeagueDataMode()) {
      const data = getStaticCharacterSheets(leagueId);
      return NextResponse.json(data);
    }

    // Get all memberships for this league (active + dropped)
    const memberships = await prisma.leagueMembership.findMany({
      where: {
        leagueId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registeredDecks: {
          take: 1,
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    // Latest commander used per player from their most recent commander pod
    const latestCommanderByUserId = new Map<string, string>();
    try {
      const latestDecks = await prisma.leagueGameDeck.findMany({
        where: { game: { leagueId, gameType: 'commander' } },
        orderBy: [{ game: { date: 'desc' } }, { createdAt: 'desc' }],
        distinct: ['playerId'],
        include: { deck: { select: { commander: true } } },
      });
      for (const row of latestDecks) {
        const commander = row.deck?.commander?.trim();
        if (commander) latestCommanderByUserId.set(row.playerId, commander);
      }
    } catch (e) {
      logger.warn('Unable to resolve latest commanders from LeagueGameDeck', {
        err: e instanceof Error ? e.message : String(e),
      });
    }

    // Get all games for this league, optionally filtered by game type
    const games = await prisma.leagueGame.findMany({
      where: {
        leagueId,
        ...gameTypeWhere,
      },
    });

    // Calculate character sheet stats for each player
    const characterSheets = await Promise.all(
      memberships.map(async membership => {
        const userId = membership.userId;
        const playerGames = games.filter((game) => {
          const players = parseJson<string[] | Array<{ playerId?: string; id?: string }>>(
            game.players,
            []
          );
          if (!Array.isArray(players)) return false;
          return players.some((p) => {
            if (typeof p === 'string') return p === userId;
            return p.playerId === userId || p.id === userId;
          });
        });

        let totalPoints = 0;
        let wins = 0;
        let losses = 0;
        let goldObjectives = 0;
        let silverObjectives = 0;
        const placements: number[] = [];

        for (const game of playerGames) {
          try {
            // Parse placements - handle both string and object formats
            const gamePlacements =
              typeof game.placements === 'string'
                ? JSON.parse(game.placements || '[]')
                : game.placements || [];

            const playerPlacement = gamePlacements.find((p: any) => {
              if (typeof p === 'string') return false;
              return p.playerId === userId || p.id === userId;
            });

            if (playerPlacement) {
              const points =
                typeof playerPlacement.points === 'number' && !Number.isNaN(playerPlacement.points)
                  ? playerPlacement.points
                  : 0;
              const rankRaw = playerPlacement.placement ?? playerPlacement.place;
              const rankKnown = typeof rankRaw === 'number' && !Number.isNaN(rankRaw);

              totalPoints += points;
              if (rankKnown) {
                placements.push(rankRaw);
                if (rankRaw === 1) {
                  wins++;
                } else {
                  losses++;
                }
              }

              // Count objectives from placement data
              if (playerPlacement.goldObjective) goldObjectives++;
              if (playerPlacement.silverObjectives) {
                silverObjectives +=
                  typeof playerPlacement.silverObjectives === 'number'
                    ? playerPlacement.silverObjectives
                    : 0;
              }
            }

            // Also check commanderObjectives from game
            if (game.commanderObjectives) {
              try {
                const objectives =
                  typeof game.commanderObjectives === 'string'
                    ? JSON.parse(game.commanderObjectives)
                    : game.commanderObjectives;

                // Check if this player won the gold objective
                const goldPlace = playerPlacement?.placement ?? playerPlacement?.place;
                if (
                  objectives.goldRoll &&
                  typeof goldPlace === 'number' &&
                  goldPlace === objectives.goldRoll
                ) {
                  goldObjectives++;
                }

                // Check claims for silver objectives
                if (objectives.claims && typeof objectives.claims === 'object') {
                  const playerClaims = Object.values(objectives.claims).filter(
                    (claim: any) => claim.playerId === userId || claim.id === userId
                  );
                  silverObjectives += playerClaims.length;
                }
              } catch (e) {
                logger.error('Error parsing commander objectives', e);
              }
            }
          } catch (e) {
            logger.error('Error processing game', e);
          }
        }

        const gamesPlayed = playerGames.length;
        const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
        const averagePlacement =
          placements.length > 0 ? placements.reduce((sum, p) => sum + p, 0) / placements.length : 0;

        // Calculate D&D-style stats based on performance
        const calculateStat = (value: number, max: number = 20) => {
          // Map performance to D&D stat (8-20 range)
          const percentage = (value / max) * 100;
          return Math.min(20, Math.max(8, Math.round(8 + (percentage / 100) * 12)));
        };

        const power = calculateStat(totalPoints, 300); // Based on total points
        const consistency = calculateStat(100 - Math.abs(winRate - 60), 60); // Consistency around 60% win rate
        const victoryRate = calculateStat(winRate, 100); // Based on win rate
        const adaptability = calculateStat(
          gamesPlayed * 2 - Math.abs(averagePlacement - 2.5) * 10,
          gamesPlayed * 2
        ); // Based on average placement
        const experience = calculateStat(gamesPlayed * 10, 120); // Based on games played

        // Level = commander games played (same as gamesPlayed for this league view).
        const level = gamesPlayed;
        const xp = gamesPlayed;
        const nextLevelXp = gamesPlayed + 1;

        // Calculate rank (sorted by total points, then average placement)
        // This will be sorted in the response

        // Generate achievements based on stats
        const achievements: string[] = [];
        if (wins >= 10) achievements.push('Unstoppable');
        if (goldObjectives >= 5) achievements.push('Gold Hunter');
        if (winRate >= 75) achievements.push('Dominator');
        if (gamesPlayed >= 15) achievements.push('Veteran');
        if (totalPoints >= 200) achievements.push('Point Master');
        if (averagePlacement <= 1.5) achievements.push('First Blood');
        if (silverObjectives >= 20) achievements.push('Silver Collector');
        if (gamesPlayed >= 10) achievements.push('Level Master');

        return {
          id: userId,
          playerName: membership.user.name || 'Unknown Player',
          active: membership.active,
          commander:
            latestCommanderByUserId.get(userId) ??
            membership.registeredDecks[0]?.commander ??
            'Unknown Commander',
          level,
          totalPoints,
          gamesPlayed,
          wins,
          losses,
          goldObjectives,
          silverObjectives,
          stats: {
            power,
            consistency,
            victoryRate,
            adaptability,
            experience,
          },
          xp,
          nextLevelXp,
          winRate,
          averagePlacement: averagePlacement || 0,
          achievements: achievements.length > 0 ? achievements : ['Rising Star'],
        };
      })
    );

    // Sort by total points (rank 1 = highest points)
    const sortedSheets = characterSheets
      .sort((a, b) => {
        // Active players first
        const aa = a.active === false ? 1 : 0;
        const bb = b.active === false ? 1 : 0;
        if (aa !== bb) return aa - bb;
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.averagePlacement - b.averagePlacement;
      })
      .map((sheet, index) => ({
        ...sheet,
        rank: index + 1,
      }));

    return NextResponse.json({ players: sortedSheets });
  } catch (error) {
    logger.error('Error fetching character sheets', error);
    return handleApiError(error);
  }
}
