import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode, getStaticDraftStandings } from '@/lib/static-league-data';

/** Avoid stale charts on CDN; DB responses must reflect live Postgres/Supabase only. */
const NO_STORE = { 'Cache-Control': 'no-store, must-revalidate' as const };

/** Public GET: latest draft standings (points earned) for the draft points chart. */
export async function GET() {
  try {
    if (isStaticLeagueDataMode()) {
      const staticData = getStaticDraftStandings();
      if (staticData) {
        return NextResponse.json(
          {
            draftName: staticData.draftName,
            standings: staticData.standings.map((s) => ({ name: s.name, points: s.points })),
          },
          { headers: NO_STORE }
        );
      }
      return NextResponse.json({ draftName: null, standings: [] }, { headers: NO_STORE });
    }

    const draft = await prisma.draftEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          orderBy: { seatNumber: 'asc' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        matches: true,
      },
    });

    // With DATABASE_URL (e.g. Supabase), never fall back to bundled JSON — return DB truth only.
    if (!draft || draft.participants.length === 0) {
      return NextResponse.json({ draftName: null, standings: [] }, { headers: NO_STORE });
    }

    const participants = draft.participants as Array<{
      id: string;
      user: { id: string; name: string | null; email: string };
    }>;
    const matches = draft.matches as Array<{
      participant1Id: string;
      participant2Id: string;
      gamesWon1: number;
      gamesWon2: number;
    }>;

    const byId = new Map(
      participants.map((p) => [
        p.id,
        {
          name: p.user?.name || p.user?.email || 'Unknown',
          matchWins: 0,
          matchPoints: 0,
        },
      ])
    );

    for (const m of matches) {
      const p1 = byId.get(m.participant1Id);
      const p2 = byId.get(m.participant2Id);
      if (!p1 || !p2) continue;
      if (m.gamesWon1 > m.gamesWon2) {
        p1.matchWins += 1;
        p1.matchPoints += 3;
      } else if (m.gamesWon2 > m.gamesWon1) {
        p2.matchWins += 1;
        p2.matchPoints += 3;
      }
    }

    const standings = Array.from(byId.values())
      .map((p) => ({ name: p.name, points: p.matchPoints }))
      .sort((a, b) => b.points - a.points);

    return NextResponse.json(
      {
        draftName: draft.name,
        standings,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    logger.error('Draft standings API error', error);
    return handleApiError(error);
  }
}
