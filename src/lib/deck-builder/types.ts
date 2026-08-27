export type DeckMode = 'commander100' | 'twoColor70';

export type CardCategory = 'commander' | 'land' | 'removal' | 'synergy' | 'creature';

export interface PoolEntry {
  name: string;
  quantity: number;
}

export interface PoolCard {
  name: string;
  quantity: number;
  scryfallId?: string;
  typeLine: string;
  colorIdentity: string[];
  oracleText: string;
  manaCost: string;
  legalities: { commander?: string };
  keywords: string[];
  /** True when Scryfall lookup failed — still usable by name only */
  unresolved?: boolean;
}

export interface DeckSkeleton {
  commander: number;
  lands: number;
  removal: number;
  synergy: number;
  creatures: number;
}

export interface GeneratedDeckCard {
  name: string;
  category: CardCategory;
  quantity: number;
}

export interface DeckGap {
  category: CardCategory;
  needed: number;
  filled: number;
}

export interface GeneratedDeck {
  mode: DeckMode;
  commander: string;
  commanderColorIdentity: string[];
  cards: GeneratedDeckCard[];
  gaps: DeckGap[];
  totalCards: number;
  targetTotal: number;
  warnings: string[];
  unresolvedPoolNames: string[];
}

export interface DeckBuilderState {
  poolText: string;
  mode: DeckMode;
  selectedCommander: string | null;
  autoSuggestCommander: boolean;
  lastGenerated: GeneratedDeck | null;
}

export const STORAGE_KEY = 'mtg-maui-deck-builder-v1';
