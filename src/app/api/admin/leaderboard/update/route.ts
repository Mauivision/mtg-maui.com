import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



interface LeaderboardUpdate {
  playerId: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  averagePlacement: number;
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();

    const body = await request.json();
    const { leagueId, updates }: { leagueId: string; updates: LeaderboardUpdate[] } = body;

    if (!leagueId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Missing required fields: leagueId, updates' },
        { status: 400 }
      );
    }

    const adminUserId = adminUser.id;

    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];

    for (const update of updates) {
      // Find the player's membership
      const membership = await prisma.leagueMembership.findFirst({
        where: {
          leagueId,
          userId: update.playerId,
          active: true,
        },
      });

      if (!membership) {
        continue;
      }

      // Get current stats from games
      const playerGames = await prisma.leagueGame.findMany({
        where: {
          leagueId,
          players: {
            contains: update.playerId,
          },
        },
      });

      let currentPoints = 0;
      let currentGames = 0;
      let currentWins = 0;

      for (const game of playerGames) {
        const placements = JSON.parse(game.placements || '[]');
        const playerPlacement = placements.find((p: any) => p.playerId === update.playerId);

        if (playerPlacement) {
          currentPoints += playerPlacement.points || 0;
          currentGames++;
          if (playerPlacement.place === 1) currentWins++;
        }
      }

      // Calculate differences
      const pointsDiff = update.totalPoints - currentPoints;
      const winsDiff = update.wins - currentWins;
      // Note: gamesPlayed is calculated from actual games, so we can't directly adjust it
      // We'll only adjust points and wins

      // If there are point or win differences, create an adjustment game
      if (pointsDiff !== 0 || winsDiff !== 0) {
        // Create an adjustment game that reflects the stat changes
        // Determine placement based on win difference (1st place = win, 4th = loss)
        const targetPlace = winsDiff > 0 ? 1 : winsDiff < 0 ? 4 : 2;

        // Calculate points for this adjustment
        // If we need to add points, give them points. If we need to subtract, create a negative adjustment
        const adjustmentPlacement = {
          playerId: update.playerId,
          place: targetPlace,
          points: Math.max(0, pointsDiff), // Only positive adjustments via games
        };

        // Create adjustment game only if there's a positive adjustment needed
        // For negative adjustments, we'd need a different mechanism (like an adjustments table)
        if (pointsDiff > 0 || winsDiff > 0) {
          await prisma.leagueGame.create({
            data: {
              leagueId,
              gameType: 'commander',
              date: new Date(),
              players: JSON.stringify([update.playerId]),
              placements: JSON.stringify([adjustmentPlacement]),
              notes: `Admin adjustment: Points=${pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff}, Wins=${winsDiff > 0 ? `+${winsDiff}` : winsDiff}`,
              recordedBy: adminUserId,
            },
          });
        }

        results.push({
          playerId: update.playerId,
          status: 'updated',
          adjustments: {
            points: pointsDiff,
            wins: winsDiff,
            note:
              pointsDiff < 0 ? 'Negative point adjustments require manual game modification' : null,
          },
        });
      } else {
        results.push({
          playerId: update.playerId,
          status: 'no_changes',
        });
      }
    }

    return NextResponse.json({
      message: `Successfully updated ${results.filter(r => r.status === 'updated').length} player(s)`,
      results,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating leaderboard', error);
    return handleApiError(error);
  }
}
