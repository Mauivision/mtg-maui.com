import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    // Get all league members with their stats
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
        // Get registered decks to find commander's name
        registeredDecks: {
          select: {
            commander: true,
          },
          take: 1, // Just get the most recent commander
          orderBy: {
            updatedAt: 'desc',
          },
        },
        // Count registered decks
        _count: {
          select: {
            registeredDecks: true,
          },
        },
      },
    });

    // Get total points for each player from all their game results
    const playersWithStats = await Promise.all(
      memberships.map(async membership => {
        const gameResults = await prisma.leagueGameDeck.findMany({
          where: {
            playerId: membership.userId,
            game: {
              leagueId,
            },
          },
          select: {
            points: true,
          },
        });

        const totalPoints = gameResults.reduce((sum, result) => sum + result.points, 0);
        const gamesPlayed = gameResults.length;

        return {
          id: membership.userId,
          name: membership.user.name,
          email: membership.user.email,
          commander: membership.registeredDecks[0]?.commander || 'Unknown',
          totalPoints,
          gamesPlayed,
          active: membership.active,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return NextResponse.json({ players: playersWithStats });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching players', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, name, email, commander } = body;

    if (!leagueId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: leagueId, name, email' },
        { status: 400 }
      );
    }

    // First, find or create the user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user with a temporary password (they'll need to reset it)
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: '$2b$10$dummy.hash.for.now', // This will need to be reset
        },
      });
    }

    // Check if user is already in the league
    const existingMembership = await prisma.leagueMembership.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this league' },
        { status: 400 }
      );
    }

    // Create league membership
    const membership = await prisma.leagueMembership.create({
      data: {
        leagueId,
        userId: user.id,
        active: true,
      },
    });

    // Create a default deck if commander is provided
    if (commander) {
      await prisma.leagueDeck.create({
        data: {
          leagueId,
          membershipId: membership.id,
          name: `${name}'s Deck`,
          commander,
          colorIdentity: JSON.stringify(['W', 'U', 'B', 'R', 'G']), // Default to all colors
          cards: JSON.stringify([]), // Empty deck
        },
      });
    }

    return NextResponse.json({
      player: {
        id: user.id,
        name: user.name,
        email: user.email,
        commander: commander || 'Unknown',
        totalPoints: 0,
        gamesPlayed: 0,
        active: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating player', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, name, commander, active } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: playerId },
        data: { name },
      });
    }

    // Update commander in their league deck if provided
    if (commander) {
      // Find the most recent league deck for this player
      const leagueDeck = await prisma.leagueDeck.findFirst({
        where: { membership: { userId: playerId } },
        orderBy: { updatedAt: 'desc' },
      });

      if (leagueDeck) {
        await prisma.leagueDeck.update({
          where: { id: leagueDeck.id },
          data: { commander },
        });
      }
    }

    // Update membership active status if provided
    if (active !== undefined) {
      await prisma.leagueMembership.updateMany({
        where: { userId: playerId },
        data: { active },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating player', error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    // Soft delete - just deactivate the membership
    await prisma.leagueMembership.updateMany({
      where: { userId: playerId },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting player', error);
    return handleApiError(error);
  }
}
