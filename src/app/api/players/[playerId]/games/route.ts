import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const querySchema = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  gameType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params;
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      leagueId: searchParams.get('leagueId') ?? undefined,
      gameType: searchParams.get('gameType') ?? undefined,
      limit: searchParams.get('limit') ?? '20',
    });

    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] ?? 'Invalid parameters';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { leagueId, gameType, limit } = parsed.data;

    // Get all games for this player in this league
    const games = await prisma.leagueGame.findMany({
      where: {
        leagueId,
        ...(gameType && { gameType }),
        players: {
          contains: playerId,
        },
      },
      include: {
        recorder: {
          select: {
            id: true,
            name: true,
          },
        },
        gameDecks: {
          include: {
            deck: {
              select: {
                id: true,
                name: true,
                commander: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    // Get all unique player IDs from all games for batch lookup
    const allPlayerIds = new Set<string>();
    games.forEach(game => {
      try {
        const players = JSON.parse(game.players);
        players.forEach((p: string) => allPlayerIds.add(p));
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Batch fetch all player names
    const allPlayers = await prisma.user.findMany({
      where: { id: { in: Array.from(allPlayerIds) } },
      select: { id: true, name: true },
    });
    const playerMap = new Map(allPlayers.map(p => [p.id, p.name]));

    // Transform games to include player-specific data
    const gameHistory = games.map(game => {
      const players = JSON.parse(game.players);
      const placements = JSON.parse(game.placements || '[]');
      const playerPlacement = placements.find((p: any) => p.playerId === playerId);

      // Get opponents (other players in the game)
      const opponents = players
        .filter((p: string) => p !== playerId)
        .map((opponentId: string) => {
          const opponentPlacement = placements.find((p: any) => p.playerId === opponentId);
          return {
            id: opponentId,
            name: playerMap.get(opponentId) || 'Unknown',
            placement: opponentPlacement?.place || null,
            points: opponentPlacement?.points || 0,
          };
        });

      // Get player's deck info if available
      const playerDeck = game.gameDecks.find(d => d.playerId === playerId);

      return {
        id: game.id,
        date: game.date.toISOString(),
        gameType: game.gameType,
        placement: playerPlacement?.place || null,
        points: playerPlacement?.points || 0,
        commander: playerDeck?.deck?.commander || null,
        deckName: playerDeck?.deck?.name || null,
        opponents,
        duration: game.duration,
        notes: game.notes,
        recordedBy: game.recorder.name,
        tableNumber: game.tableNumber,
        round: game.round,
        tournamentPhase: game.tournamentPhase,
        objectives: playerPlacement?.objectives || [],
      };
    });

    return NextResponse.json({ games: gameHistory });
  } catch (error) {
    logger.error('Error fetching player games', error);
    return handleApiError(error);
  }
}
