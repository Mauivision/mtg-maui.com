import { Deck } from '@/types/mtg';
import { LeagueDeck } from '@/types/league';

/**
 * Convert a regular Deck to LeagueDeck format for registration
 */
export function convertDeckToLeagueDeck(
  deck: Deck,
  leagueId: string,
  membershipId: string
): Partial<LeagueDeck> {
  // Find the commander (first legendary creature)
  const commander = deck.cards.find(c => {
    const type = c.card.type || '';
    return type.includes('Legendary') && type.includes('Creature');
  })?.card;

  // Extract color identity from all cards
  const colorIdentity = extractColorIdentity(deck);

  // Convert cards to league format
  const cards = deck.cards.map(c => ({
    cardId: c.card.id,
    quantity: c.quantity,
  }));

  return {
    leagueId,
    membershipId,
    name: deck.name,
    commander: commander?.id || undefined,
    colorIdentity: JSON.stringify(colorIdentity),
    cards: JSON.stringify(cards),
  };
}

/**
 * Extract color identity from a deck
 */
export function extractColorIdentity(deck: Deck): string[] {
  const colors = new Set<string>();

  deck.cards.forEach(cardEntry => {
    const manaCost = cardEntry.card.manaCost;
    if (manaCost) {
      if (manaCost.includes('W')) colors.add('W');
      if (manaCost.includes('U')) colors.add('U');
      if (manaCost.includes('B')) colors.add('B');
      if (manaCost.includes('R')) colors.add('R');
      if (manaCost.includes('G')) colors.add('G');
    }
    // Also check colors array if present
    if (cardEntry.card.colors && Array.isArray(cardEntry.card.colors)) {
      cardEntry.card.colors.forEach((color: string) => colors.add(color));
    }
  });

  return Array.from(colors).sort();
}

/**
 * Validate deck for league registration
 */
export function validateLeagueDeck(
  deck: Deck,
  cardPool?: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if deck has a commander
  const hasCommander = deck.cards.some(c => {
    const type = c.card.type || '';
    return type.includes('Legendary') && type.includes('Creature');
  });

  if (!hasCommander) {
    errors.push('Deck must have a Legendary Creature as commander');
  }

  // Check total card count (Commander format: 100 cards including commander)
  const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
  if (totalCards !== 100) {
    errors.push(`Deck must have exactly 100 cards (currently has ${totalCards})`);
  }

  // Check for commander uniqueness (only 1 copy allowed)
  const commander = deck.cards.find(c => {
    const type = c.card.type || '';
    return type.includes('Legendary') && type.includes('Creature');
  });

  if (commander && commander.quantity > 1) {
    errors.push('Commander can only have 1 copy');
  }

  // Check card pool restrictions if provided
  if (cardPool && cardPool.length > 0) {
    const invalidCards = deck.cards.filter(c => !cardPool.includes(c.card.id));
    if (invalidCards.length > 0) {
      errors.push(`${invalidCards.length} card(s) are not in the allowed card pool`);
    }
  }

  // Check for singleton (no duplicates except basic lands)
  const duplicates = deck.cards.filter(c => {
    const isBasicLand = c.card.type?.toLowerCase().includes('basic land');
    const isLand = c.card.type?.toLowerCase().includes('land');
    return c.quantity > 1 && !isBasicLand && !isLand;
  });

  if (duplicates.length > 0) {
    errors.push(
      `Non-land cards cannot have duplicates (found duplicates of: ${duplicates.map(d => d.card.name).join(', ')})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get deck statistics for display
 */
export function getDeckStats(deck: Deck) {
  const colorIdentity = extractColorIdentity(deck);
  const commander = deck.cards.find(c => {
    const type = c.card.type || '';
    return type.includes('Legendary') && type.includes('Creature');
  })?.card;

  const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
  const creatureCount = deck.cards
    .filter(c => c.card.type?.includes('Creature'))
    .reduce((sum, c) => sum + c.quantity, 0);
  const landCount = deck.cards
    .filter(c => c.card.type?.toLowerCase().includes('land'))
    .reduce((sum, c) => sum + c.quantity, 0);

  return {
    commander: commander?.name || 'No commander',
    colorIdentity,
    totalCards,
    creatureCount,
    landCount,
    otherCount: totalCards - creatureCount - landCount,
  };
}
