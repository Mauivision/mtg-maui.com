/**
 * Seed: First draft 1v1 scores (16 players, 4 rounds, match wins).
 *
 * Run from project root:
 *   npx ts-node --project tsconfig.seed.json prisma/seed-first-draft-scores.ts
 *
 * Scores (Name -> score): used as relative standings; converted to match wins (0-4) summing to 32.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Target draft VP (including undefeated +1 for Nate) — used only to derive relative match wins. */
const NAME_AND_SCORES: { name: string; score: number }[] = [
  { name: 'Nate', score: 7 },
  { name: 'Aaron H', score: 5 },
  { name: 'Dan', score: 5 },
  { name: 'Zach', score: 5 },
  { name: 'James', score: 4 },
  { name: 'Tre', score: 4 },
  { name: 'Kevin', score: 4 },
  { name: 'Travis', score: 3 },
  { name: 'Aaron V', score: 3 },
  { name: 'Scott', score: 3 },
  { name: 'Kaipo', score: 3 },
  { name: 'Ronnie', score: 3 },
  { name: 'April', score: 2 },
  { name: 'Aaron S', score: 2 },
  { name: 'Kendra', score: 1 },
  { name: 'Dustin', score: 1 },
];

function displayName(name: string | null, email: string): string {
  return (name || email || '').trim();
}

function scoreKey(nameKey: string): string {
  return nameKey.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Match a score row name to a participant's user (name/email). */
function nameMatches(scoreName: string, userName: string | null, userEmail: string): boolean {
  const key = scoreKey(scoreName);
  const disp = scoreKey(displayName(userName, userEmail));
  if (!key || !disp) return false;
  if (key === 'kalpo') return disp.includes('kalpo') || disp.includes('kaipo');
  if (key.startsWith('aaron ')) {
    const letter = key.slice(6, 7); // "h", "s", "v"
    return disp.includes('aaron') && (disp.includes(' ' + letter) || disp.includes(letter + ' ') || userEmail.toLowerCase().includes(letter));
  }
  return disp.includes(key) || key.includes(disp.split(/\s+/)[0] || '');
}

/** Convert 16 scores to 16 match wins (0-4) that sum to 32. Preserves relative order. */
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

async function main() {
  console.log('Loading first draft and participants...');
  const draft = await prisma.draftEvent.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      participants: {
        orderBy: { seatNumber: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      matches: { orderBy: [{ round: 'asc' }, { id: 'asc' }] },
    },
  });

  if (!draft) {
    console.error('No draft event found. Create a draft and add 16 participants first.');
    process.exit(1);
  }
  if (draft.participants.length !== 16) {
    console.error(`Draft has ${draft.participants.length} participants; need 16.`);
    process.exit(1);
  }
  if (draft.matches.length === 0) {
    console.error('Draft has no pairings. Generate pairings from the score table page first.');
    process.exit(1);
  }

  const participants = draft.participants as Array<{
    id: string;
    seatNumber: number;
    user: { id: string; name: string | null; email: string };
  }>;

  const matched: { participantId: string; name: string; targetWins: number }[] = [];
  const used = new Set<string>();

  const targetWinsList = scoresToMatchWins(NAME_AND_SCORES.map(r => r.score));
  console.log('Target match wins (sum=32):', targetWinsList.join(', '));

  for (let i = 0; i < NAME_AND_SCORES.length; i++) {
    const { name: scoreName } = NAME_AND_SCORES[i];
    const targetWins = targetWinsList[i];
    let found: typeof participants[0] | null = null;
    for (const p of participants) {
      if (used.has(p.id)) continue;
      const disp = displayName(p.user.name, p.user.email);
      if (nameMatches(scoreName, p.user.name, p.user.email)) {
        found = p;
        break;
      }
    }
    if (!found) {
      console.error(`Could not match "${scoreName}". Participants: ${participants.map(p => displayName(p.user.name, p.user.email)).join(', ')}`);
      process.exit(1);
    }
    used.add(found.id);
    matched.push({
      participantId: found.id,
      name: displayName(found.user.name, found.user.email),
      targetWins,
    });
  }

  const participantWins = new Map<string, number>(matched.map(m => [m.participantId, 0]));
  const targetByParticipant = new Map(matched.map(m => [m.participantId, m.targetWins]));

  type MatchRow = { id: string; participant1Id: string; participant2Id: string };
  const matches = draft.matches as MatchRow[];

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

  console.log('Updated', matches.length, 'match results.');
  console.log('Final match wins:');
  for (const m of matched) {
    const actual = participantWins.get(m.participantId) ?? 0;
    const target = targetByParticipant.get(m.participantId) ?? 0;
    console.log(`  ${m.name}: ${actual} (target ${target})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
