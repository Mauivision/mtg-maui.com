/**
 * Centralized type exports
 * Import all types from a single location
 * 
 * Note: Some types are exported selectively to avoid conflicts
 */

// Leaderboard types (no conflicts)
export * from './leaderboard';

// League types (preferred over mtg.ts for league-specific types)
export * from './league';

// MTG types (excluding duplicates that exist in league.ts)
export type {
  MTGCard,
  Commander,
  Deck,
} from './mtg';

// Wizards types (excluding ScoringRules which exists in leaderboard.ts)
export type {
  WizardPlayer,
  WizardGame,
  WizardGamePlayer,
  GoldObjective,
  FormErrors,
} from './wizards';

// NextAuth types
export * from './next-auth';
