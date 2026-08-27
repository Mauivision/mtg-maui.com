import type { DeckBuilderState } from './types';
import { STORAGE_KEY } from './types';

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
