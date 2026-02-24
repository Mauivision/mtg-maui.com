import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const games = await prisma.leagueGame.findMany({
      where: { gameType: 'commander' },
      include: {
        gameDecks: {
          include: {
            deck: {
              include: {
                membership: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { placement: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    const mapped = games
      .filter(game => game.gameDecks.length > 0)
      .map(game => {
        const decks = game.gameDecks;
        const winner = decks.find(d => d.placement === 1);
        const totalPlayers = decks.length;
        const gameName = game.notes?.trim() || `Pod — ${game.date.toISOString().slice(0, 10)}`;

        return {
        id: game.id,
        name: gameName,
        totalPlayers,
        createdAt: game.date.toISOString(),
        winner: winner
          ? {
              id: winner.deck.membership.user.id,
              name: winner.deck.membership.user.name || winner.deck.membership.user.email,
              commander: winner.deck.commander || '—',
            }
          : { id: '', name: '—', commander: '—' },
        players: decks.map(d => ({
          id: d.deck.membership.user.id,
          name: d.deck.membership.user.name || d.deck.membership.user.email,
          commander: d.deck.commander || '—',
          placement: d.placement,
          points: d.points,
          knockouts: 0,
        })),
        };
      });

    return NextResponse.json({ games: mapped });
  } catch (error) {
    logger.error('Commander games API error', error);
    return handleApiError(error);
  }
}

// Temporarily disabled due to build issues
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Endpoint temporarily disabled' }, { status: 503 });
}
