import { demoPlayersToStandings } from './demo-data';
import type { LocalLeague, StandingsRow } from './types';

export function standingsFromLeague(league: LocalLeague): StandingsRow[] {
  return demoPlayersToStandings(league.players);
}
