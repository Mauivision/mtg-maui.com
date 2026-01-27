import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// Activate all players
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'activate':
        const activateResult = await prisma.leagueMembership.updateMany({
          data: { active: true },
        });
        return NextResponse.json({
          success: true,
          message: `Activated ${activateResult.count} players`,
        });

      case 'deactivate-inactive':
        // Deactivate players who haven't played in 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        // First, find players who haven't played recently
        const inactivePlayers = await prisma.$queryRaw<Array<{ userId: string }>>`
          SELECT DISTINCT lm.userId
          FROM LeagueMembership lm
          LEFT JOIN LeagueGameParticipant lgp ON lm.userId = lgp.playerId
          LEFT JOIN LeagueGame lg ON lgp.gameId = lg.id AND lg.leagueId = lm.leagueId
          WHERE lm.active = true
          GROUP BY lm.userId, lm.leagueId
          HAVING MAX(COALESCE(lg.createdAt, lm.joinedAt)) < ${ninetyDaysAgo}
        `;

        const deactivateResult = await prisma.leagueMembership.updateMany({
          where: {
            userId: { in: inactivePlayers.map(p => p.userId) },
          },
          data: { active: false },
        });

        return NextResponse.json({
          success: true,
          message: `Deactivated ${deactivateResult.count} inactive players`,
        });

      case 'reset-points':
        // Reset all points to zero
        await prisma.leagueGameDeck.updateMany({
          data: { points: 0 },
        });

        return NextResponse.json({
          success: true,
          message: 'All player points have been reset to zero',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Bulk players operation error', error);
    return handleApiError(error);
  }
}
