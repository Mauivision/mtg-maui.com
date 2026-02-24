import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

const TOTAL_ROUNDS = 4;

type ParticipantRow = { id: string; userId: string };

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** POST generate Swiss pairings for 4 rounds. Requires exactly 16 participants. */
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

    const draft = await prisma.draftEvent.findUnique({
      where: { id: draftId },
      include: {
        participants: { orderBy: { seatNumber: 'asc' } },
        matches: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.participants.length !== 16) {
      return NextResponse.json(
        { error: 'Exactly 16 participants required to generate pairings' },
        { status: 400 }
      );
    }

    const participantIds = draft.participants.map((p: ParticipantRow) => p.id);

    // Delete existing matches so we can regenerate
    await prisma.draftMatch.deleteMany({ where: { draftEventId: draftId } });

    // Round 1: random pairings
    const round1Order = shuffle(participantIds);
    const round1Pairs: [string, string][] = [];
    for (let i = 0; i < 16; i += 2) {
      round1Pairs.push([round1Order[i], round1Order[i + 1]]);
    }

    const allMatches: { round: number; p1: string; p2: string }[] = [];
    round1Pairs.forEach(([p1, p2]) => allMatches.push({ round: 1, p1, p2 }));

    // Rounds 2–4: random pairings (Swiss would use results; when you enter results we keep these pairings)
    for (let r = 2; r <= TOTAL_ROUNDS; r++) {
      const order = shuffle(participantIds);
      for (let i = 0; i < 16; i += 2) {
        allMatches.push({ round: r, p1: order[i], p2: order[i + 1] });
      }
    }

    await prisma.draftMatch.createMany({
      data: allMatches.map(m => ({
        draftEventId: draftId,
        round: m.round,
        participant1Id: m.p1,
        participant2Id: m.p2,
        gamesWon1: 0,
        gamesWon2: 0,
      })),
    });

    const matches = await prisma.draftMatch.findMany({
      where: { draftEventId: draftId },
      orderBy: [{ round: 'asc' }, { id: 'asc' }],
      include: {
        participant1: { include: { user: { select: { id: true, name: true, email: true } } } },
        participant2: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    return NextResponse.json({ matches, totalRounds: TOTAL_ROUNDS });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error generating draft pairings', error);
    return handleApiError(error);
  }
}
