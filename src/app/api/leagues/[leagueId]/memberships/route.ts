import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params;
    const memberships = await prisma.leagueMembership.findMany({
      where: { leagueId, active: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        registeredDecks: {
          select: { id: true, name: true, commander: true, colorIdentity: true },
        },
      },
    });
    return NextResponse.json({ memberships });
  } catch (error) {
    logger.error('Error fetching memberships', error);
    return handleApiError(error);
  }
}
