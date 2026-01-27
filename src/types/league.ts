import { MTGCard } from './mtg';

export type LeagueStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type GameType = 'commander' | 'draft' | 'sealed' | 'standard';
export type DraftPodStatus = 'not_started' | 'drafting' | 'completed';
export type ParticipantStatus = 'registered' | 'checked_in' | 'dropped' | 'completed';

export interface League {
  id: string;
  name: string;
  description?: string;
  format: string; // commander, draft, etc.
  startDate: string | Date;
  endDate?: string | Date;
  status: LeagueStatus;
  maxPlayers: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  memberships?: LeagueMembership[];
  games?: LeagueGame[];
  allowedCardPools?: CardPool[];
  decks?: LeagueDeck[];
}

export interface LeagueMembership {
  id: string;
  leagueId: string;
  userId: string;
  joinedAt: string | Date;
  active: boolean;
  league?: League;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  registeredDecks?: LeagueDeck[];
}

export interface LeagueGame {
  id: string;
  leagueId?: string;
  gameType: GameType;
  date: string | Date;
  duration?: number; // in minutes
  players: string; // JSON: array of player IDs
  placements: string; // JSON: array of {playerId, place, points}
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  recordedBy: string;
  recorder?: {
    id: string;
    name: string | null;
    email: string;
  };
  league?: League;
  gameDecks?: LeagueGameDeck[];
}

export interface LeagueGameDeck {
  id: string;
  gameId: string;
  deckId: string;
  playerId: string;
  placement: number;
  points: number;
  createdAt: string | Date;
  game?: LeagueGame;
  deck?: LeagueDeck;
}

export interface LeagueDeck {
  id: string;
  leagueId: string;
  membershipId: string;
  name: string;
  commander?: string; // Commander card ID
  colorIdentity: string; // JSON array of colors
  cards: string; // JSON: array of {cardId, quantity}
  createdAt: string | Date;
  updatedAt: string | Date;
  membership?: LeagueMembership;
  league?: League;
  gameResults?: LeagueGameDeck[];
  // Parsed data (populated in components)
  parsedCommander?: MTGCard;
  parsedCards?: Array<{
    card: MTGCard;
    quantity: number;
  }>;
  parsedColors?: string[];
}

export interface CardPool {
  id: string;
  leagueId: string;
  name: string;
  description?: string;
  cardIds: string; // JSON: array of allowed card IDs
  maxCardLimit?: number; // Optional per-card limit
  createdAt: string | Date;
  updatedAt: string | Date;
  league?: League;
  // Parsed data
  parsedCardIds?: string[];
}

export interface DraftEvent {
  id: string;
  name: string;
  format: string; // draft, sealed, etc.
  date: string | Date;
  status: LeagueStatus;
  maxParticipants: number;
  creatorId: string;
  creator?: {
    id: string;
    name: string | null;
    email: string;
  };
  pods?: DraftPod[];
  participants?: DraftParticipant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DraftPod {
  id: string;
  draftEventId: string;
  name: string;
  status: DraftPodStatus;
  currentRound: number;
  totalRounds: number;
  startTime?: string | Date;
  endTime?: string | Date;
  draftEvent?: DraftEvent;
  participants?: DraftParticipant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DraftParticipant {
  id: string;
  draftEventId: string;
  draftPodId: string;
  userId: string;
  seatNumber: number;
  registeredDeck?: string; // JSON: deck configuration
  status: ParticipantStatus;
  checkInTime?: string | Date;
  dropTime?: string | Date;
  draftEvent?: DraftEvent;
  draftPod?: DraftPod;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  draftPickResults?: DraftPickResult[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DraftPickResult {
  id: string;
  draftParticipantId: string;
  round: number;
  pickNumber: number;
  cardId: string;
  timestamp: string | Date;
  participant?: DraftParticipant;
  // Parsed data
  card?: MTGCard;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  averagePlacement: number;
  eloRating: number;
  favoriteCommanders: Array<{
    commanderId: string;
    commanderName: string;
    gamesPlayed: number;
    winRate: number;
  }>;
  recentGames: LeagueGame[];
  colorPreferences: Record<string, number>;
  typePreferences: Record<string, number>;
}

export interface LeaderboardEntry {
  id?: string;
  rank: number;
  playerId: string;
  playerName: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses?: number;
  averagePlacement: number;
  eloRating: number;
  recentForm: Array<'W' | 'L' | 'D'>;
}

export interface GameSubmissionData {
  leagueId?: string;
  gameType: GameType;
  date: string;
  duration?: number;
  players: Array<{
    playerId: string;
    playerName: string;
    deckId?: string;
    commander?: string;
  }>;
  placements: Array<{
    playerId: string;
    place: number;
    points: number;
    deckId?: string;
  }>;
  notes?: string;
}

export interface DeckSubmissionData {
  leagueId: string;
  name: string;
  commander?: MTGCard;
  cards: Array<{
    card: MTGCard;
    quantity: number;
  }>;
  colorIdentity: string[];
}
