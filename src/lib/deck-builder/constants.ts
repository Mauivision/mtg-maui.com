import type { DeckSkeleton } from './types';

/** Aaron Vanderpool 100-card Commander skeleton (99 + commander). */
export const SKELETON_100: DeckSkeleton = {
  commander: 1,
  lands: 37,
  removal: 8,
  synergy: 18,
  creatures: 36,
};

/** Scaled 70-card list (69 + commander) for casual two-color builds. */
export const SKELETON_70: DeckSkeleton = {
  commander: 1,
  lands: 26,
  removal: 6,
  synergy: 13,
  creatures: 24,
};

export const MIN_POOL_CARDS_100 = 100;
export const MIN_POOL_CARDS_70 = 70;

/** Season 4 flagship commander — Marvel Mutant Hero, GW flying / targeted-spell tribal. */
export const FLAGSHIP_COMMANDER = 'Storm, Windrider';

export const BASIC_LAND_NAMES = new Set([
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Wastes',
  'Snow-Covered Plains',
  'Snow-Covered Island',
  'Snow-Covered Swamp',
  'Snow-Covered Mountain',
  'Snow-Covered Forest',
]);
