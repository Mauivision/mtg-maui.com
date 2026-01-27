// Types for Wizards page components
export interface WizardPlayer {
  id: string;
  name: string;
  email: string;
  commander?: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  active: boolean;
}

export interface WizardGame {
  id: string;
  date: string;
  season?: string;
  pod?: string;
  format: string;
  gameType: 'commander' | 'draft' | 'standard';
  players: WizardGamePlayer[];
  notes?: string;
  winner?: string;
  tableNumber?: number;
  round?: number;
  tournamentPhase?: string;
  goldObjective?: GoldObjective | boolean;
  silverObjectives?: number;
}

export interface WizardGamePlayer {
  playerId: string;
  playerName: string;
  commander?: string;
  points: number;
  placement: number;
  goldObjective?: boolean;
  silverObjectives?: number;
}

export interface ScoringRules {
  goldObjective: number;
  silverObjective: number;
  placementBonus: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

export interface GoldObjective {
  id: number;
  name: string;
  description: string;
}

export interface FormErrors {
  [key: string]: string;
}