import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;

    // Get authenticated user
    const user = await getAuthenticatedUser();
    const userId = user.id;

    // Check if user is already a member
    const existingMembership = await prisma.leagueMembership.findFirst({
      where: {
        leagueId,
        userId,
      },
    });

    if (existingMembership) {
      if (existingMembership.active) {
        return NextResponse.json({ error: 'Already a member of this league' }, { status: 400 });
      } else {
        // Reactivate membership
        const membership = await prisma.leagueMembership.update({
          where: { id: existingMembership.id },
          data: { active: true },
        });
        return NextResponse.json({ membership });
      }
    }

    // Check league capacity
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { memberships: true },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    if (league.memberships.length >= league.maxPlayers) {
      return NextResponse.json({ error: 'League is full' }, { status: 400 });
    }

    // Create new membership
    const membership = await prisma.leagueMembership.create({
      data: {
        leagueId,
        userId,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    logger.error('Error joining league', error);
    return handleApiError(error);
  }
}
