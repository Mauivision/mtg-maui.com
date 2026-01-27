import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// System bulk operations
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'generate-pairings': {
        // Auto-generate pairings for next tournament round
        // This is a simplified version - would need tournament/round logic

        const body = await request.json().catch(() => ({}));
        const { leagueId, gameType = 'commander', round = 1 } = body;

        if (!leagueId) {
          return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
        }

        // Get active memberships
        const memberships = await prisma.leagueMembership.findMany({
          where: {
            leagueId,
            active: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (memberships.length < 4) {
          return NextResponse.json(
            { error: 'Need at least 4 players to generate pairings' },
            { status: 400 }
          );
        }

        // Simple pairing algorithm (round-robin style)
        const pairings = [];
        const shuffled = [...memberships].sort(() => Math.random() - 0.5);

        for (let i = 0; i < shuffled.length; i += 4) {
          const pod = shuffled.slice(i, i + 4);
          if (pod.length >= 4) {
            pairings.push({
              leagueId,
              gameType,
              round,
              players: pod.map(m => ({
                userId: m.userId,
                playerName: m.user.name,
              })),
              scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            });
          }
        }

        // Create pairings in database (would need Pairing model)
        // For now, return the pairings structure
        return NextResponse.json({
          success: true,
          message: `Generated ${pairings.length} pairings for round ${round}`,
          pairings,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Bulk system operation error', error);
    return handleApiError(error);
  }
}

// Backup endpoint
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    // Redirect to main bulk export endpoint
    const url = new URL(request.url);
    url.pathname = '/api/admin/bulk';
    return NextResponse.redirect(url.toString());
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Backup creation error', error);
    return handleApiError(error);
  }
}
