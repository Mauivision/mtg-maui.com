import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// Game bulk operations
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'recalculate-scores': {
        // Redirect to existing recalculate endpoint
        // This is handled by /api/admin/leaderboard/recalculate
        return NextResponse.json({
          success: true,
          message: 'Use /api/admin/leaderboard/recalculate endpoint',
        });
      }

      case 'delete-old': {
        // Delete games older than 1 year
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

        // First delete related records
        const oldGames = await prisma.leagueGame.findMany({
          where: {
            date: {
              lt: oneYearAgo,
            },
          },
          select: {
            id: true,
          },
        });

        const gameIds = oldGames.map(g => g.id);

        // Delete game decks
        await prisma.leagueGameDeck.deleteMany({
          where: {
            gameId: { in: gameIds },
          },
        });

        // Delete game decks (participants)
        await prisma.leagueGameDeck.deleteMany({
          where: {
            gameId: { in: gameIds },
          },
        });

        // Delete games
        const result = await prisma.leagueGame.deleteMany({
          where: {
            id: { in: gameIds },
          },
        });

        return NextResponse.json({
          success: true,
          message: `Deleted ${result.count} games older than 1 year`,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Bulk games operation error', error);
    return handleApiError(error);
  }
}
