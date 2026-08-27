import { createDefaultLeagueFromDemo, DEFAULT_LEAGUE_NAME } from './demo-data';
import type { LocalLeague } from './types';

export const LEAGUES_STORAGE_KEY = 'mtg-maui-leagues-v1';
export const ACTIVE_LEAGUE_KEY = 'mtg-maui-active-league-id';
export const MEMBERSHIP_TOKEN_KEY = 'mtg-maui-membership-token';

function readLeaguesRaw(): LocalLeague[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEAGUES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalLeague[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLeagues(leagues: LocalLeague[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues));
}

export function ensureDefaultLeague(): LocalLeague[] {
  let leagues = readLeaguesRaw();
  if (leagues.length === 0) {
    leagues = [createDefaultLeagueFromDemo()];
    writeLeagues(leagues);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_LEAGUE_KEY, leagues[0].id);
    }
  }
  return leagues;
}

export function loadLeagues(): LocalLeague[] {
  return ensureDefaultLeague();
}

export function saveLeague(league: LocalLeague): void {
  const leagues = ensureDefaultLeague();
  const idx = leagues.findIndex((l) => l.id === league.id);
  const updated = { ...league, updatedAt: new Date().toISOString() };
  if (idx >= 0) leagues[idx] = updated;
  else leagues.push(updated);
  writeLeagues(leagues);
}

export function createLeague(name: string, season = 4): LocalLeague {
  const now = new Date().toISOString();
  const league: LocalLeague = {
    id: `league-${Date.now()}`,
    name: name.trim() || 'My League',
    season,
    players: [],
    games: [],
    createdAt: now,
    updatedAt: now,
  };
  saveLeague(league);
  return league;
}

export function deleteLeague(id: string): void {
  const leagues = ensureDefaultLeague().filter((l) => l.id !== id);
  if (leagues.length === 0) leagues.push(createDefaultLeagueFromDemo());
  writeLeagues(leagues);
  const active = getActiveLeagueId();
  if (active === id) setActiveLeagueId(leagues[0].id);
}

export function getActiveLeagueId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_LEAGUE_KEY);
}

export function setActiveLeagueId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_LEAGUE_KEY, id);
}

export function getActiveLeague(): LocalLeague {
  const leagues = ensureDefaultLeague();
  const id = getActiveLeagueId();
  return leagues.find((l) => l.id === id) ?? leagues.find((l) => l.name === DEFAULT_LEAGUE_NAME) ?? leagues[0];
}

export function importLeaguesJson(json: string): { ok: true; count: number } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as unknown;
    const leagues = Array.isArray(parsed) ? parsed : [parsed];
    if (!leagues.every(isValidLeague)) {
      return { ok: false, error: 'Invalid league JSON shape' };
    }
    writeLeagues(leagues as LocalLeague[]);
    return { ok: true, count: leagues.length };
  } catch {
    return { ok: false, error: 'Could not parse JSON' };
  }
}

function isValidLeague(v: unknown): v is LocalLeague {
  if (!v || typeof v !== 'object') return false;
  const l = v as LocalLeague;
  return typeof l.id === 'string' && typeof l.name === 'string' && Array.isArray(l.players);
}

export function exportLeaguesJson(): string {
  return JSON.stringify(ensureDefaultLeague(), null, 2);
}

export function generateInviteToken(): string {
  const token = `maui-${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEMBERSHIP_TOKEN_KEY, token);
  }
  return token;
}

export function saveMembershipToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBERSHIP_TOKEN_KEY, token.trim());
}

export function getMembershipToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MEMBERSHIP_TOKEN_KEY);
}
