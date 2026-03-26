// Leaderboard Types - Comprehensive type definitions for leaderboard features

/**
 * Realtime leaderboard entry returned from the API
 */
export interface RealtimeLeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  /** Commander pod points (included in points when present). */
  commanderPoints?: number;
  /** Commander VP from pods in rounds 1–5 (season first half). */
  commanderGame1Points?: number;
  /** Commander VP from pods in rounds 6+ (season second half). */
  commanderGame2Points?: number;
  /** Draft 1v1 points (included in points when present). */
  draftPoints?: number;
  /** Draft 1 match VP counted toward league total (Tim’s first draft is 0 here). */
  draftLeaguePoints1?: number;
  /** Draft 2 match VP counted toward league total. */
  draftLeaguePoints2?: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'same';
  lastActive: string;
  goldObjectives?: number;
  silverObjectives?: number;
  /** First draft points when player played for someone else (e.g. Tim for Dan); shown but not in total. */
  firstDraftPointsPlayedForDan?: number;
  /** Optional per-player draft breakdown (static / API), e.g. draft bonuses. */
  draftDetail?: string;
}

/**
 * Traditional leaderboard entry with more detailed stats
 */
export interface TraditionalLeaderboardEntry {
  id: string;
  rank: number;
  playerId: string;
  playerName: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  averagePlacement: number;
  eloRating: number;
  recentForm: Array<'W' | 'L' | 'D'>;
  previousRank?: number;
  favoriteCommander?: string;
  colorIdentity?: string[];
}

/**
 * Editable leaderboard entry for admin editing
 */
export interface EditableLeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  totalPoints: number;
  commanderPoints?: number;
  draftPoints?: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  averagePlacement: number;
  eloRating: number;
  recentForm: Array<'W' | 'L' | 'D'>;
}

/**
 * Player update payload for bulk editing
 */
export interface PlayerUpdatePayload {
  playerId: string;
  totalPoints?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  averagePlacement?: number;
  eloRating?: number;
}

/**
 * Scoring rules configuration
 */
export interface ScoringRules {
  goldObjective: number;
  silverObjective: number;
  placementBonus: Record<number, number>;
}

/**
 * Filter options for leaderboard queries
 */
export interface LeaderboardFilters {
  gameType: 'all' | 'commander' | 'draft' | 'standard';
  sortBy: 'points' | 'winRate' | 'gamesPlayed' | 'recentForm';
  dateRange: 'all' | 'week' | 'month' | 'season';
  commanderFilter: string;
}

/**
 * Player game history entry
 */
export interface PlayerGameHistory {
  id: string;
  gameType: string;
  date: string;
  duration?: number;
  placement: number;
  points: number;
  commander?: string;
  opponents?: Array<{
    id: string;
    name: string;
    placement?: number;
  }>;
  objectives?: string[];
  notes?: string;
  tableNumber?: number;
  round?: number;
  tournamentPhase?: string;
}

/**
 * API response for leaderboard data
 */
export interface LeaderboardApiResponse {
  entries: TraditionalLeaderboardEntry[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * API response for realtime leaderboard
 */
export interface RealtimeLeaderboardApiResponse {
  entries: RealtimeLeaderboardEntry[];
  lastUpdate?: string;
}
