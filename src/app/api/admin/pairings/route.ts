import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getAuthenticatedUser } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// Get commander game pairings (upcoming games/pods)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const gameType = searchParams.get('gameType') || 'commander';

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    // Get upcoming games (future dates or today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const games = await prisma.leagueGame.findMany({
      where: {
        leagueId,
        gameType,
        date: {
          gte: today,
        },
      },
      include: {
        recorder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform to pairings format
    const pairings = games.map(game => ({
      id: game.id,
      date: game.date.toISOString().split('T')[0],
      gameType: game.gameType,
      players: game.players ? JSON.parse(game.players) : [],
      placements: game.placements ? JSON.parse(game.placements) : [],
      tableNumber: game.tableNumber,
      round: game.round,
      tournamentPhase: game.tournamentPhase,
      notes: game.notes,
      recordedBy: game.recorder.name,
    }));

    return NextResponse.json({ pairings });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching pairings', error);
    return handleApiError(error);
  }
}

// Create a new pairing (scheduled game)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { leagueId, gameType, date, players, tableNumber, round, tournamentPhase, notes } = body;

    if (!leagueId || !gameType || !date || !players) {
      return NextResponse.json(
        { error: 'Missing required fields: leagueId, gameType, date, players' },
        { status: 400 }
      );
    }

    // Get authenticated user for recordedBy
    const user = await getAuthenticatedUser();
    const recordedBy = user.id;

    // Create game with empty placements (to be filled after game is played)
    const game = await prisma.leagueGame.create({
      data: {
        leagueId,
        gameType,
        date: new Date(date),
        players: JSON.stringify(players),
        placements: JSON.stringify([]), // Empty until game is played
        tableNumber,
        round,
        tournamentPhase,
        notes,
        recordedBy,
      },
    });

    return NextResponse.json({ pairing: game }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating pairing', error);
    return handleApiError(error);
  }
}

// Update a pairing
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, date, players, tableNumber, round, tournamentPhase, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Pairing ID required' }, { status: 400 });
    }

    const game = await prisma.leagueGame.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        players: players ? JSON.stringify(players) : undefined,
        tableNumber,
        round,
        tournamentPhase,
        notes,
      },
    });

    return NextResponse.json({ pairing: game });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating pairing', error);
    return handleApiError(error);
  }
}

// Delete a pairing
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pairingId = searchParams.get('id');

    if (!pairingId) {
      return NextResponse.json({ error: 'Pairing ID required' }, { status: 400 });
    }

    await prisma.leagueGame.delete({
      where: { id: pairingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting pairing', error);
    return handleApiError(error);
  }
}
