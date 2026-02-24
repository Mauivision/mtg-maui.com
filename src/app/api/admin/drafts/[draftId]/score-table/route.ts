import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

const TOTAL_ROUNDS = 4;
const EXPECTED_PARTICIPANTS = 16;

type ParticipantWithUser = {
  id: string;
  seatNumber: number;
  user: { id: string; name: string | null; email: string };
};

type MatchWithParticipants = {
  id: string;
  round: number;
  gamesWon1: number;
  gamesWon2: number;
  participant1: ParticipantWithUser;
  participant2: ParticipantWithUser;
};

function computeStandings(
  participants: ParticipantWithUser[],
  matches: MatchWithParticipants[]
): Array<{ participantId: string; name: string; matchWins: number; matchLosses: number; gamesWon: number; gamesLost: number; matchPoints: number }> {
  const byId = new Map(participants.map(p => [p.id, { ...p, matchWins: 0, matchLosses: 0, gamesWon: 0, gamesLost: 0 }]));

  for (const m of matches) {
    const p1 = byId.get(m.participant1?.id ?? (m as any).participant1Id);
    const p2 = byId.get(m.participant2?.id ?? (m as any).participant2Id);
    if (!p1 || !p2) continue;
    const gw1 = m.gamesWon1;
    const gw2 = m.gamesWon2;
    (p1 as any).gamesWon += gw1;
    (p1 as any).gamesLost += gw2;
    (p2 as any).gamesWon += gw2;
    (p2 as any).gamesLost += gw1;
    if (gw1 > gw2) {
      (p1 as any).matchWins += 1;
      (p2 as any).matchLosses += 1;
    } else if (gw2 > gw1) {
      (p2 as any).matchWins += 1;
      (p1 as any).matchLosses += 1;
    }
  }

  return Array.from(byId.values()).map(p => ({
    participantId: p.id,
    name: p.user?.name || p.user?.email || 'Unknown',
    matchWins: (p as any).matchWins,
    matchLosses: (p as any).matchLosses,
    gamesWon: (p as any).gamesWon,
    gamesLost: (p as any).gamesLost,
    matchPoints: (p as any).matchWins * 3, // 3 pts per match win
  }));
}

/** GET score table: draft, participants, matches, standings */
export async function GET(
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
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { seatNumber: 'asc' },
        },
        matches: {
          include: {
            participant1: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            participant2: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
          orderBy: [{ round: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const participants = draft.participants as unknown as ParticipantWithUser[];
    const matches = draft.matches as unknown as MatchWithParticipants[];
    const standings = computeStandings(participants, matches);
    standings.sort((a, b) => b.matchPoints - a.matchPoints);

    return NextResponse.json({
      draft: {
        id: draft.id,
        name: draft.name,
        format: draft.format,
        date: draft.date,
        status: draft.status,
        maxParticipants: draft.maxParticipants,
      },
      participants,
      matches,
      standings,
      totalRounds: TOTAL_ROUNDS,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error fetching draft score table', error);
    return handleApiError(error);
  }
}

/** POST set 16 participants (from league or manual). Body: { participantUserIds: string[] } */
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
    const { participantUserIds } = body as { participantUserIds?: string[] };
    if (!Array.isArray(participantUserIds) || participantUserIds.length !== EXPECTED_PARTICIPANTS) {
      return NextResponse.json(
        { error: `Exactly ${EXPECTED_PARTICIPANTS} participant user IDs required` },
        { status: 400 }
      );
    }

    const draft = await prisma.draftEvent.findUnique({ where: { id: draftId }, include: { pods: true } });
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    let pod = draft.pods[0];
    if (!pod) {
      pod = await prisma.draftPod.create({
        data: {
          draftEventId: draftId,
          name: 'Main',
          status: 'not_started',
          totalRounds: TOTAL_ROUNDS,
        },
      });
    }

    // Remove existing participants for this event so we can replace with new 16
    await prisma.draftParticipant.deleteMany({ where: { draftEventId: draftId } });

    await prisma.draftParticipant.createMany({
      data: participantUserIds.map((userId, index) => ({
        draftEventId: draftId,
        draftPodId: pod.id,
        userId,
        seatNumber: index + 1,
        status: 'registered',
      })),
    });

    const updated = await prisma.draftEvent.findUnique({
      where: { id: draftId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ participants: updated?.participants ?? [] });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error setting draft participants', error);
    return handleApiError(error);
  }
}
