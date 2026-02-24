import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

type ResultEntry = {
  matchId: string;
  gamesWon1: number;
  gamesWon2: number;
};

/** POST bulk update 1v1 match scores. Body: { results: ResultEntry[] } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    await requireAdminOrSimple(request);
    const { draftId } = await params;
    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { results } = body as { results?: ResultEntry[] };
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Body must include a non-empty "results" array of { matchId, gamesWon1, gamesWon2 }' },
        { status: 400 }
      );
    }

    const draftMatchIds = new Set(
      (await prisma.draftMatch.findMany({
        where: { draftEventId: draftId },
        select: { id: true },
      })).map((m) => m.id)
    );

    const updates: Array<{ matchId: string; gamesWon1: number; gamesWon2: number }> = [];
    for (const r of results) {
      if (!r.matchId || typeof r.gamesWon1 !== 'number' || typeof r.gamesWon2 !== 'number') continue;
      const g1 = Math.max(0, Math.min(3, Math.floor(r.gamesWon1)));
      const g2 = Math.max(0, Math.min(3, Math.floor(r.gamesWon2)));
      if (g1 + g2 > 3) continue;
      if (!draftMatchIds.has(r.matchId)) continue;
      updates.push({ matchId: r.matchId, gamesWon1: g1, gamesWon2: g2 });
    }

    await prisma.$transaction(
      updates.map((u) =>
        prisma.draftMatch.update({
          where: { id: u.matchId },
          data: { gamesWon1: u.gamesWon1, gamesWon2: u.gamesWon2 },
        })
      )
    );

    return NextResponse.json({
      updated: updates.length,
      message: `Updated ${updates.length} match result(s).`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error bulk updating draft match results', error);
    return handleApiError(error);
  }
}
