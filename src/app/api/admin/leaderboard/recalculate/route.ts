import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    // Get all games for this league
    const games = await prisma.leagueGame.findMany({
      where: { leagueId },
      include: {
        gameDecks: true,
      },
    });

    // Get scoring rules for this league
    const scoringRules = await prisma.scoringRule.findMany({
      where: {
        leagueId,
        active: true,
      },
    });

    let updatedCount = 0;

    // Recalculate points for each game participant
    for (const game of games) {
      const placements = JSON.parse(game.placements);

      for (const placement of placements) {
        let newPoints = 0;

        // Calculate points based on current scoring rules
        for (const rule of scoringRules) {
          if (rule.gameType !== game.gameType) continue;

          switch (rule.name) {
            case 'Gold Objective':
              const goldObjs = placement.goldObjectives || 0;
              newPoints += rule.points * goldObjs;
              break;

            case 'Silver Objective':
              const silverObjs = placement.silverObjectives || 0;
              newPoints += rule.points * silverObjs;
              break;

            case `Placement ${placement.place}${placement.place === 1 ? 'st' : placement.place === 2 ? 'nd' : placement.place === 3 ? 'rd' : 'th'}`:
            case `Placement ${placement.place}`:
              newPoints += rule.points;
              break;
          }
        }

        // Add participation points if no other points earned
        if (newPoints === 0) {
          const participationRule = scoringRules.find(
            r => r.gameType === game.gameType && r.name.toLowerCase().includes('participation')
          );
          if (participationRule) {
            newPoints = participationRule.points;
          } else {
            // Default participation points
            newPoints = 1;
          }
        }

        // Update the points in the database
        if (placement.points !== newPoints) {
          await prisma.leagueGameDeck.updateMany({
            where: {
              gameId: game.id,
              playerId: placement.playerId,
            },
            data: {
              points: newPoints,
            },
          });

          // Update the placements JSON as well
          placement.points = newPoints;
          updatedCount++;
        }
      }

      // Update the game's placements JSON
      await prisma.leagueGame.update({
        where: { id: game.id },
        data: {
          placements: JSON.stringify(placements),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated points for ${updatedCount} game results`,
      updatedCount,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Leaderboard recalculation error', error);
    return handleApiError(error);
  }
}
