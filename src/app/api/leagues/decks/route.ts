import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, membershipId, name, commander, colorIdentity, cards } = body;

    // Get authenticated user
    const user = await getAuthenticatedUser();

    // First, get or create league membership
    let membership;
    if (membershipId) {
      membership = await prisma.leagueMembership.findUnique({
        where: { id: membershipId },
      });

      // Verify the membership belongs to the authenticated user
      if (membership && membership.userId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized: This membership does not belong to you' },
          { status: 403 }
        );
      }
    } else {
      const userId = user.id;

      // Find existing membership or create new one
      membership = await prisma.leagueMembership.findFirst({
        where: {
          leagueId,
          userId,
          active: true,
        },
      });

      if (!membership) {
        membership = await prisma.leagueMembership.create({
          data: {
            leagueId,
            userId,
            active: true,
          },
        });
      }
    }

    // Create the league deck
    const deck = await prisma.leagueDeck.create({
      data: {
        leagueId,
        membershipId: membership!.id,
        name,
        commander: commander || null,
        colorIdentity: JSON.stringify(colorIdentity),
        cards: JSON.stringify(cards),
      },
      include: {
        membership: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    logger.error('Error creating league deck', error);
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const membershipId = searchParams.get('membershipId');

    const where: { leagueId?: string; membershipId?: string } = {};
    if (leagueId) where.leagueId = leagueId;
    if (membershipId) where.membershipId = membershipId;

    const decks = await prisma.leagueDeck.findMany({
      where,
      include: {
        membership: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
        gameResults: {
          include: {
            game: {
              select: {
                id: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    logger.error('Error fetching league decks', error);
    return handleApiError(error);
  }
}
