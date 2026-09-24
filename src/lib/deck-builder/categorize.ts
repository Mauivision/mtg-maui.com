import { BASIC_LAND_NAMES, FLAGSHIP_COMMANDER } from './constants';
import type { CardCategory, PoolCard } from './types';

const REMOVAL_PATTERNS = [
  /destroy target/i,
  /destroy another target/i,
  /destroy up to/i,
  /exile target/i,
  /exile .* until/i,
  /counter target/i,
  /deals .* damage to (any )?target/i,
  /damage to (any )?target/i,
  /return .* to .* owner's hand/i,
  /return target .* to/i,
  /fight target/i,
  /fights target/i,
  /sacrifice .*:? destroy/i,
  /\-(\d+)\/-(\d+) until end of turn/i,
  /tap target .*\. .* destroy/i,
  /destroy all/i,
  /exile all/i,
];

export function isBasicLand(name: string, typeLine: string): boolean {
  if (BASIC_LAND_NAMES.has(name)) return true;
  return typeLine.toLowerCase().includes('basic land');
}

export function isLand(card: PoolCard): boolean {
  return card.typeLine.toLowerCase().includes('land');
}

export function isCreature(card: PoolCard): boolean {
  return card.typeLine.toLowerCase().includes('creature');
}

export function isLegendary(card: PoolCard): boolean {
  return card.typeLine.toLowerCase().includes('legendary');
}

export function canBeCommander(card: PoolCard): boolean {
  if (card.unresolved) return false;
  const cmd = card.legalities.commander;
  if (cmd !== 'legal' && cmd !== 'restricted') return false;

  const type = card.typeLine.toLowerCase();
  if (type.includes('legendary') && type.includes('creature')) return true;
  if (type.includes('legendary') && type.includes('planeswalker')) {
    return (card.oracleText || '').toLowerCase().includes('can be your commander');
  }
  return false;
}

export function isRemoval(card: PoolCard): boolean {
  if (isLand(card)) return false;
  const text = card.oracleText || '';
  if (!text && card.unresolved) return false;
  return REMOVAL_PATTERNS.some((p) => p.test(text));
}

export function colorIdentitySubset(cardColors: string[], commanderColors: string[]): boolean {
  if (commanderColors.length === 0) return cardColors.length === 0;
  return cardColors.every((c) => commanderColors.includes(c));
}

export function categorizeCard(card: PoolCard, commanderName: string): CardCategory {
  if (isLand(card)) return 'land';
  if (isCreature(card)) return 'creature';
  if (isRemoval(card)) return 'removal';
  // Non-creature spells, artifacts, enchantments, planeswalkers → synergy
  void commanderName;
  return 'synergy';
}

export function isStormWindrider(commander: PoolCard): boolean {
  return commander.name.toLowerCase() === FLAGSHIP_COMMANDER.toLowerCase();
}

export function hasFlying(card: PoolCard): boolean {
  if (card.keywords.some((k) => k.toLowerCase() === 'flying')) return true;
  const type = card.typeLine.toLowerCase();
  if (!type.includes('creature')) return false;
  return (card.oracleText || '').toLowerCase().includes('flying');
}

/** Storm keyword / copy-for-each-spell mechanic — not the card Storm, Windrider. */
export function isStormCountMechanic(card: PoolCard): boolean {
  if (card.name.toLowerCase() === FLAGSHIP_COMMANDER.toLowerCase()) return false;
  if (card.keywords.some((k) => k.toLowerCase() === 'storm')) return true;
  const text = card.oracleText || '';
  return /copy (it|this spell) for each.*spell cast before/i.test(text);
}

export function targetsCreatures(card: PoolCard): boolean {
  const text = card.oracleText || '';
  const type = card.typeLine.toLowerCase();
  if (type.includes('aura') || /enchant creature/i.test(text)) return true;
  return (
    /target creature/i.test(text) ||
    /target up to [^.]* creature/i.test(text) ||
    /targets? one or more creatures/i.test(text) ||
    /target creature(s)? you control/i.test(text) ||
    (/exile target creature you control/i.test(text) && /return.*battlefield/i.test(text))
  );
}

export function stormWindriderSynergyScore(card: PoolCard): number {
  let score = 0;
  const oracle = (card.oracleText || '').toLowerCase();
  const type = card.typeLine.toLowerCase();

  if (targetsCreatures(card)) score += 10;
  if (type.includes('aura') || oracle.includes('enchant creature')) score += 8;
  if (/creatures you control get|creatures you control gain|each creature you control gets/i.test(oracle)) {
    score += 7;
  }
  if (
    (/can't be blocked|hexproof|indestructible|protection from|ward/i.test(oracle) ||
      type.includes('equipment')) &&
    (targetsCreatures(card) || type.includes('equipment'))
  ) {
    score += 5;
  }
  if (/exile target creature you control/i.test(oracle) && /return.*battlefield/i.test(oracle)) {
    score += 6;
  }

  if (isStormCountMechanic(card)) {
    score += targetsCreatures(card) ? 1 : -15;
  }

  if (oracle.includes('draw')) score += 2;

  return score;
}

export function stormWindriderCreatureScore(card: PoolCard): number {
  if (!isCreature(card)) return 0;
  return hasFlying(card) ? 10 : 0;
}

export function categoryPickScore(
  card: PoolCard,
  commander: PoolCard,
  category: CardCategory
): number {
  if (category === 'synergy') return synergyScore(card, commander);
  if (category === 'creature' && isStormWindrider(commander)) {
    return stormWindriderCreatureScore(card);
  }
  return 0;
}

export function synergyScore(card: PoolCard, commander: PoolCard): number {
  if (isStormWindrider(commander)) {
    return stormWindriderSynergyScore(card);
  }

  let score = 0;
  const oracle = (card.oracleText || '').toLowerCase();
  const cmdName = commander.name.toLowerCase();

  if (oracle.includes(cmdName)) score += 12;

  const cmdTypes = extractCreatureTypes(commander.typeLine);
  const cardTypes = extractCreatureTypes(card.typeLine);
  for (const t of cmdTypes) {
    if (cardTypes.includes(t)) score += 4;
  }

  for (const c of card.colorIdentity) {
    if (commander.colorIdentity.includes(c)) score += 1;
  }

  const type = card.typeLine.toLowerCase();
  if (type.includes('enchantment') || type.includes('artifact') || type.includes('equipment')) {
    score += 2;
  }
  if (oracle.includes('draw') || oracle.includes('add {') || oracle.includes('search your library')) {
    score += 3;
  }

  return score;
}

function extractCreatureTypes(typeLine: string): string[] {
  const match = typeLine.match(/creature\s*(?:\u2014|-)\s*(.+)/i);
  if (!match) return [];
  return match[1].split(/\s*(?:\u2014|-)\s*/).map((t) => t.trim().toLowerCase()).filter(Boolean);
}

export function formatColorIdentity(colors: string[]): string {
  if (colors.length === 0) return 'Colorless';
  const order = ['W', 'U', 'B', 'R', 'G'];
  return order.filter((c) => colors.includes(c)).join('');
}
