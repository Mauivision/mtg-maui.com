import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createGameSchema = z.object({
  leagueId: z.string().optional().nullable(),
  gameType: z.enum(['commander', 'draft', 'standard']),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().int().positive().optional().nullable(),
  players: z.array(z.string()),
  placements: z.array(
    z.object({
      playerId: z.string(),
      deckId: z.string().optional(),
      place: z.number().int().positive(),
      points: z.number().int().min(0),
    })
  ),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createGameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] || 'Invalid input' },
        { status: 400 }
      );
    }
    const { leagueId, gameType, date, duration, players, placements, notes } = parsed.data;

    const user = await getAuthenticatedUser();

    // Create the league game
    const game = await prisma.leagueGame.create({
      data: {
        leagueId: leagueId || null,
        gameType,
        date: new Date(date),
        duration: duration || null,
        players: JSON.stringify(players),
        placements: JSON.stringify(placements),
        notes: notes || null,
        recordedBy: user.id,
      },
    });

    // If there are deck associations in placements, create LeagueGameDeck records
    for (const placement of placements) {
      if (placement.deckId) {
        await prisma.leagueGameDeck.create({
          data: {
            gameId: game.id,
            deckId: placement.deckId,
            playerId: placement.playerId,
            placement: placement.place,
            points: placement.points,
          },
        });
      }
    }

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    logger.error('Error creating league game', error);
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    const where = leagueId ? { leagueId } : {};

    const games = await prisma.leagueGame.findMany({
      where,
      include: {
        recorder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        league: {
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
      take: 50,
    });

    return NextResponse.json({ games });
  } catch (error) {
    logger.error('Error fetching league games', error);
    return handleApiError(error);
  }
}
