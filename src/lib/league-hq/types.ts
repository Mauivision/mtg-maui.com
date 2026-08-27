export interface StandingsRow {
  id: string;
  name: string;
  commanderPoints: number;
  draftPoints: number;
  total: number;
  rank: number;
}

export interface LeagueEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
}

export interface LeaguePlayer {
  id: string;
  name: string;
  commanderPoints: number;
  draftPoints: number;
}

export interface LeagueGameResult {
  playerId: string;
  place: number;
  points: number;
}

export interface LeagueGame {
  id: string;
  date: string;
  pod: string;
  results: LeagueGameResult[];
}

export interface LocalLeague {
  id: string;
  name: string;
  season: number;
  players: LeaguePlayer[];
  games: LeagueGame[];
  createdAt: string;
  updatedAt: string;
}

export interface LeagueHqStats {
  totalUsers: number;
  totalLeagues: number;
  totalGames: number;
  totalDrafts: number;
  totalEvents: number;
  newsCount: number;
}
