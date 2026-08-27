import {
  canBeCommander,
  categorizeCard,
  categoryPickScore,
  colorIdentitySubset,
  formatColorIdentity,
  isBasicLand,
} from './categorize';
import { FLAGSHIP_COMMANDER, MIN_POOL_CARDS_100, MIN_POOL_CARDS_70, SKELETON_100, SKELETON_70 } from './constants';
import { parsePoolText, totalPoolCount } from './parse-pool';
import { lookupPoolCards } from './scryfall';
import type {
  DeckGap,
  DeckMode,
  DeckSkeleton,
  GeneratedDeck,
  GeneratedDeckCard,
  PoolCard,
} from './types';

export interface GenerateOptions {
  poolText: string;
  mode: DeckMode;
  selectedCommander: string | null;
  autoSuggestCommander: boolean;
}

export interface GenerateResult {
  ok: true;
  deck: GeneratedDeck;
}

export interface GenerateError {
  ok: false;
  message: string;
  legalCommanders?: string[];
}

function skeletonForMode(mode: DeckMode): DeckSkeleton {
  return mode === 'commander100' ? SKELETON_100 : SKELETON_70;
}

function minPoolForMode(mode: DeckMode): number {
  return mode === 'commander100' ? MIN_POOL_CARDS_100 : MIN_POOL_CARDS_70;
}

function targetTotal(mode: DeckMode): number {
  return mode === 'commander100' ? 100 : 70;
}

function findCommanderCard(cards: PoolCard[], name: string): PoolCard | undefined {
  return cards.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

function legalCommanders(cards: PoolCard[]): PoolCard[] {
  return cards.filter(canBeCommander);
}

function pickSuggestedCommander(cards: PoolCard[], mode: DeckMode): PoolCard | null {
  const commanders = legalCommanders(cards);
  if (commanders.length === 0) return null;

  const storm = findCommanderCard(cards, FLAGSHIP_COMMANDER);
  if (storm && canBeCommander(storm)) {
    if (mode !== 'twoColor70' || storm.colorIdentity.length === 2) {
      return storm;
    }
  }

  let best: PoolCard | null = null;
  let bestCount = -1;

  for (const cmd of commanders) {
    if (mode === 'twoColor70' && cmd.colorIdentity.length !== 2) continue;
    const count = cards.filter(
      (c) =>
        c.name.toLowerCase() !== cmd.name.toLowerCase() &&
        colorIdentitySubset(c.colorIdentity, cmd.colorIdentity)
    ).length;
    if (count > bestCount) {
      bestCount = count;
      best = cmd;
    }
  }

  if (best) return best;
  // Fallback: any legal commander if two-color filter excluded all
  if (mode === 'twoColor70') {
    const twoColor = commanders.filter((c) => c.colorIdentity.length === 2);
    return twoColor[0] ?? null;
  }
  return commanders[0] ?? null;
}

interface AvailableCard {
  card: PoolCard;
  remaining: number;
}

function buildAvailability(cards: PoolCard[], excludeName: string): AvailableCard[] {
  return cards
    .filter((c) => c.name.toLowerCase() !== excludeName.toLowerCase())
    .map((c) => ({ card: c, remaining: c.quantity }));
}

function pickCards(
  available: AvailableCard[],
  category: GeneratedDeckCard['category'],
  count: number,
  commander: PoolCard,
  usedNames: Set<string>
): { picked: GeneratedDeckCard[]; filled: number } {
  const candidates = available
    .filter((a) => a.remaining > 0)
    .filter((a) => categorizeCard(a.card, commander.name) === category)
    .map((a) => ({
      ...a,
      score: categoryPickScore(a.card, commander, category),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.card.name.localeCompare(b.card.name);
    });

  const picked: GeneratedDeckCard[] = [];
  let filled = 0;

  for (const { card, remaining } of candidates) {
    if (filled >= count) break;
    const key = card.name.toLowerCase();
    const allowMulti = isBasicLand(card.name, card.typeLine);
    if (!allowMulti && usedNames.has(key)) continue;

    const need = count - filled;
    const take = allowMulti ? Math.min(need, remaining) : 1;
    if (take <= 0) continue;

    picked.push({ name: card.name, category, quantity: take });
    filled += take;
    if (!allowMulti) usedNames.add(key);

    const entry = available.find((a) => a.card.name === card.name);
    if (entry) entry.remaining -= take;
  }

  return { picked, filled };
}

export async function generateDeckFromPool(
  options: GenerateOptions
): Promise<GenerateResult | GenerateError> {
  const { poolText, mode, selectedCommander, autoSuggestCommander } = options;
  const entries = parsePoolText(poolText);
  const poolTotal = totalPoolCount(entries);
  const minPool = minPoolForMode(mode);

  if (poolTotal < minPool) {
    return {
      ok: false,
      message: `Add at least ${minPool} cards to your pool (currently ${poolTotal}).`,
    };
  }

  const poolCards = await lookupPoolCards(entries);
  const unresolvedPoolNames = poolCards.filter((c) => c.unresolved).map((c) => c.name);
  const commanders = legalCommanders(poolCards);

  if (commanders.length === 0) {
    return {
      ok: false,
      message:
        'No legal Commander found in your pool. Add a legendary creature (or planeswalker that can be your commander) that is legal in Commander.',
    };
  }

  let commander: PoolCard | null = null;

  if (selectedCommander) {
    commander = findCommanderCard(poolCards, selectedCommander) ?? null;
    if (!commander || !canBeCommander(commander)) {
      return {
        ok: false,
        message: `"${selectedCommander}" is not a legal commander from your pool.`,
        legalCommanders: commanders.map((c) => c.name),
      };
    }
  } else if (autoSuggestCommander) {
    commander = pickSuggestedCommander(poolCards, mode);
  }

  if (!commander) {
    return {
      ok: false,
      message: 'Pick a commander from your pool, or enable auto-suggest.',
      legalCommanders: commanders.map((c) => c.name),
    };
  }

  if (mode === 'twoColor70' && commander.colorIdentity.length !== 2) {
    const twoColorCmds = commanders.filter((c) => c.colorIdentity.length === 2);
    return {
      ok: false,
      message: `Two-color mode needs a two-color commander. "${commander.name}" is ${formatColorIdentity(commander.colorIdentity) || 'colorless'}.`,
      legalCommanders: twoColorCmds.map((c) => c.name),
    };
  }

  const skeleton = skeletonForMode(mode);
  const warnings: string[] = [];
  const legalCards = poolCards.filter((c) =>
    colorIdentitySubset(c.colorIdentity, commander!.colorIdentity)
  );

  const illegalCount = poolCards.length - legalCards.length;
  if (illegalCount > 0) {
    warnings.push(
      `${illegalCount} pool card(s) fall outside ${commander.name}'s ${formatColorIdentity(commander.colorIdentity)} identity and were skipped.`
    );
  }

  if (legalCards.filter((c) => c.name !== commander!.name).length < skeleton.lands + skeleton.removal) {
    warnings.push('Your pool is thin for this commander identity — expect gaps below.');
  }

  const available = buildAvailability(legalCards, commander.name);
  const usedNames = new Set<string>();
  const deckCards: GeneratedDeckCard[] = [];
  const gaps: DeckGap[] = [];

  const categories: { key: keyof Omit<DeckSkeleton, 'commander'>; cat: GeneratedDeckCard['category'] }[] = [
    { key: 'lands', cat: 'land' },
    { key: 'removal', cat: 'removal' },
    { key: 'synergy', cat: 'synergy' },
    { key: 'creatures', cat: 'creature' },
  ];

  for (const { key, cat } of categories) {
    const needed = skeleton[key];
    const { picked, filled } = pickCards(available, cat, needed, commander, usedNames);
    deckCards.push(...picked);
    if (filled < needed) {
      gaps.push({ category: cat, needed, filled });
    }
  }

  const nonCommanderCount = deckCards.reduce((s, c) => s + c.quantity, 0);
  const target = targetTotal(mode);
  const expectedNonCommander = target - 1;

  if (nonCommanderCount < expectedNonCommander) {
    warnings.push(
      `Only ${nonCommanderCount} of ${expectedNonCommander} non-commander slots could be filled from your pool.`
    );
  }

  if (unresolvedPoolNames.length > 0) {
    warnings.push(
      `${unresolvedPoolNames.length} card name(s) could not be verified on Scryfall — they were excluded from generation.`
    );
  }

  const deck: GeneratedDeck = {
    mode,
    commander: commander.name,
    commanderColorIdentity: commander.colorIdentity,
    cards: deckCards,
    gaps,
    totalCards: nonCommanderCount + 1,
    targetTotal: target,
    warnings,
    unresolvedPoolNames,
  };

  return { ok: true, deck };
}

export { legalCommanders as getLegalCommandersFromPool };
