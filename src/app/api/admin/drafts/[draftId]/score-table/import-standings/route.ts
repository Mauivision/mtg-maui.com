import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

function displayName(name: string | null, email: string): string {
  return (name || email || '').trim();
}

function scoreKey(nameKey: string): string {
  return nameKey.toLowerCase().replace(/\s+/g, ' ').trim();
}

function nameMatches(scoreName: string, userName: string | null, userEmail: string): boolean {
  const key = scoreKey(scoreName);
  const disp = scoreKey(displayName(userName, userEmail));
  if (!key || !disp) return false;
  if (key === 'kalpo') return disp.includes('kalpo') || disp.includes('kaipo');
  if (key.startsWith('aaron ')) {
    const letter = key.slice(6, 7);
    return disp.includes('aaron') && (disp.includes(' ' + letter) || disp.includes(letter + ' ') || userEmail.toLowerCase().includes(letter));
  }
  return disp.includes(key) || (key.length >= 2 && (disp.includes(key) || (disp.split(/\s+/)[0] && key.includes(disp.split(/\s+/)[0]!))));
}

function scoresToMatchWins(scores: number[]): number[] {
  const total = scores.reduce((a, b) => a + b, 0);
  if (total === 0) return scores.map(() => 0);
  const scaled = scores.map(s => (s * 32) / total);
  const wins = scaled.map(s => Math.min(4, Math.floor(s)));
  let sum = wins.reduce((a, b) => a + b, 0);
  const remainder = scaled.map((s, i) => ({ i, frac: s - wins[i] })).sort((a, b) => b.frac - a.frac);
  for (const { i } of remainder) {
    if (sum >= 32) break;
    if (wins[i] < 4) {
      wins[i]++;
      sum++;
    }
  }
  while (sum > 32) {
    const maxIdx = wins.indexOf(Math.max(...wins));
    if (wins[maxIdx] <= 0) break;
    wins[maxIdx]--;
    sum--;
  }
  return wins;
}

type StandingEntry = { name: string; score: number };

/**
 * POST import standings by name+score. Converts scores to match wins (sum 32) and updates all match results.
 * Body: { standings: { name: string, score: number }[] }
 */
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
    const { standings } = body as { standings?: StandingEntry[] };
    if (!Array.isArray(standings) || standings.length !== 16) {
      return NextResponse.json(
        { error: 'Body must include "standings" array with exactly 16 { name, score } entries' },
        { status: 400 }
      );
    }

    const draft = await prisma.draftEvent.findUnique({
      where: { id: draftId },
      include: {
        participants: {
          orderBy: { seatNumber: 'asc' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        matches: { orderBy: [{ round: 'asc' }, { id: 'asc' }] },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }
    if (draft.participants.length !== 16) {
      return NextResponse.json(
        { error: `Draft has ${draft.participants.length} participants; need 16` },
        { status: 400 }
      );
    }
    if (draft.matches.length === 0) {
      return NextResponse.json(
        { error: 'No pairings. Generate pairings first from the score table.' },
        { status: 400 }
      );
    }

    const participants = draft.participants as Array<{
      id: string;
      user: { id: string; name: string | null; email: string };
    }>;

    const targetWinsList = scoresToMatchWins(standings.map(s => Number(s.score) || 0));
    const matched: { participantId: string; targetWins: number }[] = [];
    const used = new Set<string>();

    for (let i = 0; i < standings.length; i++) {
      const scoreName = String(standings[i]!.name).trim();
      const targetWins = targetWinsList[i]!;
      let found: (typeof participants)[0] | null = null;
      for (const p of participants) {
        if (used.has(p.id)) continue;
        if (nameMatches(scoreName, p.user.name, p.user.email)) {
          found = p;
          break;
        }
      }
      if (!found) {
        const names = participants.map(p => displayName(p.user.name, p.user.email)).join(', ');
        return NextResponse.json(
          { error: `Could not match "${scoreName}". Participants: ${names}` },
          { status: 400 }
        );
      }
      used.add(found.id);
      matched.push({ participantId: found.id, targetWins });
    }

    const participantWins = new Map<string, number>(matched.map(m => [m.participantId, 0]));
    const targetByParticipant = new Map(matched.map(m => [m.participantId, m.targetWins]));

    const matches = draft.matches as Array<{ id: string; participant1Id: string; participant2Id: string }>;

    for (const m of matches) {
      const t1 = targetByParticipant.get(m.participant1Id) ?? 0;
      const t2 = targetByParticipant.get(m.participant2Id) ?? 0;
      const w1 = participantWins.get(m.participant1Id) ?? 0;
      const w2 = participantWins.get(m.participant2Id) ?? 0;
      const need1 = t1 - w1;
      const need2 = t2 - w2;
      const p1Wins = need1 >= need2;
      if (p1Wins) {
        participantWins.set(m.participant1Id, w1 + 1);
      } else {
        participantWins.set(m.participant2Id, w2 + 1);
      }
      const gamesWon1 = p1Wins ? 2 : 0;
      const gamesWon2 = p1Wins ? 0 : 2;
      await prisma.draftMatch.update({
        where: { id: m.id },
        data: { gamesWon1, gamesWon2 },
      });
    }

    return NextResponse.json({
      updated: matches.length,
      message: `Imported standings and updated ${matches.length} match results.`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Error importing draft standings', error);
    return handleApiError(error);
  }
}
