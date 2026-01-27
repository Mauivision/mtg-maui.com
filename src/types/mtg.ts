export type GameType = 'standard' | 'commander' | 'modern' | 'pioneer' | 'legacy' | 'vintage';

export interface MTGCard {
  id: string;
  name: string;
  manaCost: string | null;
  cmc: number;
  type: string;
  text?: string;
  power?: string | null;
  toughness?: string | null;
  loyalty?: number | null;
  imageUrl?: string | null;
  setCode: string;
  setName?: string | null;
  rarity: string;
  colors?: string[];
  flavorText?: string | null;
  artist?: string | null;
  number?: string | null;
  price?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeckCard {
  card: MTGCard;
  quantity: number;
}

export interface Deck {
  id?: string;
  name: string;
  description?: string;
  format: Format;
  cards: DeckCard[];
  isPublic?: boolean;
  userId?: string;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeckAnalysis {
  totalCards: number;
  colorDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  cmcDistribution: Record<number, number>;
  averageCmc: number;
  totalPrice: number;
}

export interface CardSearchResult {
  cards: MTGCard[];
  totalCards: number;
  hasMore: boolean;
  nextPage?: string;
}

export type Format = 'standard' | 'modern' | 'commander' | 'pioneer' | 'historic';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic';
export type Color = 'W' | 'U' | 'B' | 'R' | 'G';

export interface ChaosCard extends MTGCard {
  chaosRating: number;
  synergy: number;
  unpredictability: number;
  funFactor: number;
}

export interface ChaosDeck {
  id: string;
  name: string;
  commander: MTGCard;
  cards: MTGCard[];
  sideboard: MTGCard[];
  totalChaos: number;
  averageSynergy: number;
  unpredictabilityScore: number;
  funRating: number;
  budget: number;
  colorIdentity: string[];
  themes: string[];
}

export interface SearchResult {
  name: string;
  set: string;
  type: string;
  manaCost: string;
  imageUrl?: string;
}

export interface DeckStats {
  totalCards: number;
  averageCmc: number;
  colorDistribution: { [key: string]: number };
  cardTypes: { [key: string]: number };
  manaCurve: { [key: number]: number };
  totalPrice: number;
}

export interface MetaData {
  popularity: number;
  winRate: number;
  metaTrends: string[];
}

export interface GoldfishState {
  hand: MTGCard[];
  battlefield: MTGCard[];
  library: MTGCard[];
  manaPool: { [color: string]: number };
  turn: number;
}

export interface CommanderDeck {
  commander: MTGCard | null;
  cards: MTGCard[];
  creatures: MTGCard[];
  spells: MTGCard[];
  artifacts: MTGCard[];
  enchantments: MTGCard[];
  planeswalkers: MTGCard[];
  lands: MTGCard[];
}

export interface CardPool {
  cards: MTGCard[];
  totalCards: number;
  colorIdentity: string[];
}

export interface DeckGenerationResult {
  deck: MTGCard[];
  commander?: MTGCard;
}

export interface MetaAnalysis {
  popularity: number;
  winRate: number;
  metaTrends: string[];
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commander {
  id: string;
  name: string;
  colors: string[];
  type: string;
  imageUrl?: string;
}

export interface Game {
  id: string;
  date: Date;
  players: GamePlayer[];
  notes?: string;
  type: 'COMMANDER' | 'DRAFT';
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePlayer {
  playerId: string;
  playerName: string;
  finishPlace: number;
  points: number;
  commander: string;
}

// League interface removed as not core to deck builder/tournament keeper functionality

export interface PlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  averageFinish: number;
  eloRating: number;
  favoriteCommanders: {
    commanderId: string;
    commanderName: string;
    gamesPlayed: number;
    winRate: number;
  }[];
  recentGames: Game[];
  colorPreferences: {
    [key: string]: number;
  };
  typePreferences: {
    [key: string]: number;
  };
}

export interface DraftEvent {
  id: string;
  date: Date;
  players: Player[];
  pods: DraftPod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftPod {
  id: string;
  players: Player[];
  results: Array<{
    playerId: string;
    playerName: string;
    finishPlace: number;
    points: number;
  }>;
}

export interface CardFilters {
  colors: string[];
  types: string[];
  rarity: string[];
  cmc: number[];
  price: number[];
  chaosRating: number[];
  format: GameType;
}

// Tournament and Match Types
export interface Tournament {
  id: string;
  name: string;
  format: GameType;
  startDate: string;
  endDate?: string;
  maxPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  creatorId: string;
  participants?: TournamentParticipant[];
  matches?: Match[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  user?: User;
  joinedAt: Date;
}

export interface Match {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  round: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role?: string;
}

export interface GameResult {
  id: string;
  gameType: GameType;
  players: string[];
  winner?: string;
  duration?: number;
  createdAt: Date;
  userId: string;
}
