import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple, resolveRecordedByUserId } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const gameType = searchParams.get('gameType');
    const id = searchParams.get('id');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    const games = await prisma.leagueGame.findMany({
      where: {
        leagueId,
        ...(id && { id }),
        ...(gameType && { gameType }),
      },
      include: {
        recorder: {
          select: {
            id: true,
            name: true,
          },
        },
        gameDecks: {
          include: {
            deck: {
              include: {
                membership: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transform the data to match our frontend expectations
    const transformedGames = games.map(game => ({
      id: game.id,
      date: game.date.toISOString().split('T')[0],
      gameType: game.gameType,
      tournamentPhase: game.tournamentPhase,
      round: game.round,
      tableNumber: game.tableNumber,
      duration: game.duration,
      notes: game.notes,
      winner: game.placements ? JSON.parse(game.placements)[0]?.playerId : null,
      players: game.players ? JSON.parse(game.players) : [],
      placements: game.placements ? JSON.parse(game.placements) : [],
      goldObjective: game.commanderObjectives ? JSON.parse(game.commanderObjectives) : null,
      recordedBy: game.recordedBy,
      recorderName: game.recorder.name,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    }));

    return NextResponse.json({ games: transformedGames });
  } catch (error) {
    logger.error('Error fetching games', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminOrSimple(request);
    const body = await request.json();
    const {
      leagueId,
      gameType,
      date,
      tournamentPhase,
      round,
      tableNumber,
      players,
      placements,
      notes,
      goldObjective,
    } = body;

    if (!leagueId || !gameType || !players || !placements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const recordedBy = await resolveRecordedByUserId(user);
    const game = await prisma.leagueGame.create({
      data: {
        leagueId,
        gameType,
        tournamentPhase,
        round,
        tableNumber,
        date: new Date(date),
        players: JSON.stringify(players),
        placements: JSON.stringify(placements),
        commanderObjectives: goldObjective ? JSON.stringify(goldObjective) : null,
        notes,
        recordedBy,
      },
    });

    // Create LeagueGameDeck entries for each player to track points
    for (const placement of placements) {
      if (placement.playerId) {
        // Find the player's deck for this league
        const membership = await prisma.leagueMembership.findFirst({
          where: {
            userId: placement.playerId,
            leagueId,
            active: true,
          },
          include: {
            registeredDecks: {
              take: 1,
              orderBy: { updatedAt: 'desc' },
            },
          },
        });

        if (membership?.registeredDecks[0]) {
          await prisma.leagueGameDeck.create({
            data: {
              gameId: game.id,
              deckId: membership.registeredDecks[0].id,
              playerId: placement.playerId,
              placement: placement.placement || placement.place || 1,
              points: placement.points || 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ game });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating game', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const body = await request.json();
    const {
      id,
      gameType,
      date,
      tournamentPhase,
      round,
      tableNumber,
      players,
      placements,
      notes,
      goldObjective,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    const game = await prisma.leagueGame.update({
      where: { id },
      data: {
        gameType,
        tournamentPhase,
        round,
        tableNumber,
        date: date ? new Date(date) : undefined,
        players: players ? JSON.stringify(players) : undefined,
        placements: placements ? JSON.stringify(placements) : undefined,
        commanderObjectives:
          goldObjective !== undefined
            ? goldObjective
              ? JSON.stringify(goldObjective)
              : null
            : undefined,
        notes,
      },
    });

    // Update LeagueGameDeck entries if placements are provided
    if (placements && Array.isArray(placements)) {
      // Get the league ID from the game
      const gameWithLeague = await prisma.leagueGame.findUnique({
        where: { id },
        select: { leagueId: true },
      });

      if (gameWithLeague?.leagueId) {
        // Delete existing game deck entries
        await prisma.leagueGameDeck.deleteMany({
          where: { gameId: id },
        });

        // Create new game deck entries
        for (const placement of placements) {
          if (placement.playerId) {
            const membership = await prisma.leagueMembership.findFirst({
              where: {
                userId: placement.playerId,
                leagueId: gameWithLeague.leagueId,
                active: true,
              },
              include: {
                registeredDecks: {
                  take: 1,
                  orderBy: { updatedAt: 'desc' },
                },
              },
            });

            if (membership?.registeredDecks[0]) {
              await prisma.leagueGameDeck.create({
                data: {
                  gameId: id,
                  deckId: membership.registeredDecks[0].id,
                  playerId: placement.playerId,
                  placement: placement.placement || placement.place || 1,
                  points: placement.points || 0,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ game });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating game', error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    await prisma.leagueGame.delete({
      where: { id: gameId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting game', error);
    return handleApiError(error);
  }
}
