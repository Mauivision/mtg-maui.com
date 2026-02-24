import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

/** PATCH update match result (best of 3: games 0–2 each, first to 2 wins) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string; matchId: string }> }
) {
  try {
    await requireAdminOrSimple(request);
    const { draftId, matchId } = await params;
    if (!draftId || !matchId) {
      return NextResponse.json({ error: 'Draft ID and Match ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { gamesWon1, gamesWon2 } = body as { gamesWon1?: number; gamesWon2?: number };

    if (gamesWon1 === undefined && gamesWon2 === undefined) {
      return NextResponse.json({ error: 'Provide gamesWon1 and/or gamesWon2' }, { status: 400 });
    }

    const match = await prisma.draftMatch.findFirst({
      where: { id: matchId, draftEventId: draftId },
    });
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const gw1 = gamesWon1 !== undefined ? Math.max(0, Math.min(3, Math.floor(gamesWon1))) : match.gamesWon1;
    const gw2 = gamesWon2 !== undefined ? Math.max(0, Math.min(3, Math.floor(gamesWon2))) : match.gamesWon2;
    if (gw1 + gw2 > 3) {
      return NextResponse.json({ error: 'Best of 3: total games per match cannot exceed 3' }, { status: 400 });
    }

    const updated = await prisma.draftMatch.update({
      where: { id: matchId },
      data: { gamesWon1: gw1, gamesWon2: gw2 },
      include: {
        participant1: { include: { user: { select: { id: true, name: true, email: true } } } },
        participant2: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    return NextResponse.json({ match: updated });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error updating draft match', error);
    return handleApiError(error);
  }
}
