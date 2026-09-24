import type { DeckBuilderState, GeneratedDeck, SavedDeck } from './types';
import { SAVED_DECKS_KEY, STORAGE_KEY } from './types';

const DEFAULT_STATE: DeckBuilderState = {
  poolText: '',
  mode: 'commander100',
  selectedCommander: null,
  autoSuggestCommander: true,
  lastGenerated: null,
};

export function loadDeckBuilderState(): DeckBuilderState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DeckBuilderState>;
    return {
      poolText: parsed.poolText ?? DEFAULT_STATE.poolText,
      mode: parsed.mode === 'twoColor70' ? 'twoColor70' : 'commander100',
      selectedCommander: parsed.selectedCommander ?? null,
      autoSuggestCommander: parsed.autoSuggestCommander ?? true,
      lastGenerated: parsed.lastGenerated ?? null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveDeckBuilderState(state: DeckBuilderState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function readSavedDecksRaw(): SavedDeck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_DECKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { decks?: SavedDeck[] } | SavedDeck[];
    if (Array.isArray(parsed)) return parsed;
    return Array.isArray(parsed.decks) ? parsed.decks : [];
  } catch {
    return [];
  }
}

function writeSavedDecks(decks: SavedDeck[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify({ decks }));
  } catch {
    // ignore quota errors
  }
}

export function listSavedDecks(): SavedDeck[] {
  return readSavedDecksRaw().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveGeneratedDeck(name: string, deck: GeneratedDeck, description?: string): SavedDeck {
  const entry: SavedDeck = {
    id: `deck-${Date.now()}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    deck,
  };
  const all = readSavedDecksRaw();
  all.unshift(entry);
  writeSavedDecks(all.slice(0, 40));
  return entry;
}

export function deleteSavedDeck(id: string): void {
  writeSavedDecks(readSavedDecksRaw().filter((d) => d.id !== id));
}
