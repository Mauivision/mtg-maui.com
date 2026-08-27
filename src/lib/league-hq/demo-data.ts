import season4Demo from '@/data/season4-demo.json';
import type { LeagueEvent, LeagueHqStats, LeaguePlayer, StandingsRow } from './types';

export const SEASON4_DEMO = season4Demo;

export const DEFAULT_LEAGUE_NAME = season4Demo.meta.leagueName;
export const SEASON4_DISCLAIMER = season4Demo.meta.disclaimer;

export function getDemoStats(): LeagueHqStats {
  return { ...season4Demo.stats };
}

export function getDemoEvents(): LeagueEvent[] {
  return season4Demo.events;
}

export function getDemoNews() {
  return season4Demo.news;
}

export function demoPlayersToStandings(players: LeaguePlayer[]): StandingsRow[] {
  const sorted = [...players]
    .map((p) => ({
      id: p.id,
      name: p.name,
      commanderPoints: p.commanderPoints,
      draftPoints: p.draftPoints,
      total: p.commanderPoints + p.draftPoints,
      rank: 0,
    }))
    .sort((a, b) => b.total - a.total || b.commanderPoints - a.commanderPoints);

  return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getDemoStandings(limit?: number): StandingsRow[] {
  const rows = demoPlayersToStandings(
    season4Demo.standings.map((s) => ({
      id: s.id,
      name: s.name,
      commanderPoints: s.commanderPoints,
      draftPoints: s.draftPoints,
    }))
  );
  return limit ? rows.slice(0, limit) : rows;
}

export function createDefaultLeagueFromDemo(): import('./types').LocalLeague {
  const now = new Date().toISOString();
  return {
    id: 'mtg-maui-season-4',
    name: DEFAULT_LEAGUE_NAME,
    season: season4Demo.meta.season,
    players: season4Demo.standings.map((s) => ({
      id: s.id,
      name: s.name,
      commanderPoints: s.commanderPoints,
      draftPoints: s.draftPoints,
    })),
    games: [],
    createdAt: now,
    updatedAt: now,
  };
}
