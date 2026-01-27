import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const tournamentId = params.tournamentId;

    // Get tournament basic info
    const tournament = await prisma.league.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Get all games for this tournament
    const games = await prisma.leagueGame.findMany({
      where: { leagueId: tournamentId },
      orderBy: { createdAt: 'asc' },
    });

    // Get all unique player IDs
    const playerIds = new Set<string>();
    games.forEach(game => {
      const placements = JSON.parse(game.placements || '[]');
      placements.forEach((participant: any) => {
        playerIds.add(participant.playerId);
      });
    });

    // Batch fetch player names
    const players = await prisma.user.findMany({
      where: { id: { in: Array.from(playerIds) } },
      select: { id: true, name: true },
    });
    const playerNameMap = new Map(players.map(p => [p.id, p.name]));

    // Create player map with actual names
    const playerMap = new Map();
    Array.from(playerIds).forEach((playerId, index) => {
      playerMap.set(playerId, {
        id: playerId,
        name: playerNameMap.get(playerId) || playerId, // Fallback to ID if name not found
        seed: index + 1,
        status: 'waiting',
        commander: null, // Will be set from game data if available
        points: 0,
      });
    });

    games.forEach((game) => {
      const placements = parseJson<Array<{ playerId: string; commander?: string }>>(
        game.placements || '[]',
        []
      );
      placements.forEach((p) => {
        const player = playerMap.get(p.playerId);
        if (player && p.commander) player.commander = p.commander;
      });
    });

    const tournamentPlayers = Array.from(playerMap.values());

    // Calculate player statuses and points
    tournamentPlayers.forEach(player => {
      let totalPoints = 0;
      let wins = 0;
      let isEliminated = false;

      games.forEach(game => {
        const placements = JSON.parse(game.placements || '[]');
        const participant = placements.find((p: any) => p.playerId === player.id);
        if (participant) {
          totalPoints += participant.points || 0;
          if (participant.place === 1) wins++;

          // Determine status based on recent games
          if (game.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            // Last 24 hours
            if (participant.place === 1) {
              player.status = 'won';
            } else if (participant.place <= placements.length / 2) {
              player.status = 'playing';
            } else {
              player.status = 'lost';
            }
          }
        }
      });

      player.points = totalPoints;

      // Mark as eliminated if they haven't won recently and tournament is advanced
      if (wins === 0 && games.length > 2) {
        player.status = 'eliminated';
      }
    });

    // Create bracket structure (simplified single elimination)
    const totalRounds = Math.ceil(Math.log2(tournamentPlayers.length));
    const matches: any[] = [];

    // Round 1 matches
    for (let i = 0; i < Math.floor(tournamentPlayers.length / 2); i++) {
      const player1 = tournamentPlayers[i * 2];
      const player2 = tournamentPlayers[i * 2 + 1];

      // Determine winner based on points (simplified)
      const winner = player1.points > player2.points ? player1 : player2;

      matches.push({
        id: `round1-match${i + 1}`,
        round: 1,
        match: i + 1,
        player1,
        player2,
        winner,
        status: 'completed',
        scheduledTime: new Date().toISOString(),
      });
    }

    // Add quarterfinals, semifinals, finals based on winners
    if (totalRounds >= 2) {
      const round1Winners = matches.map(m => m.winner);
      for (let i = 0; i < Math.floor(round1Winners.length / 2); i++) {
        const player1 = round1Winners[i * 2];
        const player2 = round1Winners[i * 2 + 1];
        const winner = player1.points > player2.points ? player1 : player2;

        matches.push({
          id: `round2-match${i + 1}`,
          round: 2,
          match: i + 1,
          player1,
          player2,
          winner,
          status: 'completed',
        });
      }
    }

    // Determine overall winner
    const finalMatch = matches.find(m => m.round === Math.max(...matches.map(m => m.round)));
    const winner = finalMatch?.winner;

    const bracketData = {
      id: tournament.id,
      name: tournament.name,
      format: 'single_elimination',
      totalRounds,
      currentRound: Math.max(...matches.map(m => m.round)),
      status: winner ? 'completed' : 'in_progress',
      players,
      matches,
      winner,
      createdAt: tournament.createdAt.toISOString(),
    };

    return NextResponse.json(bracketData);
  } catch (error) {
    logger.error('Tournament bracket API error', error);
    return handleApiError(error);
  }
}
