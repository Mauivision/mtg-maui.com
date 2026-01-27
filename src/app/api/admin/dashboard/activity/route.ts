import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    // Get recent activity from various sources
    const [recentUsers, recentGames, recentLeagues, recentEvents] = await Promise.all([
      // New users (last 7 days)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { id: 'desc' },
        take: 5,
      }),

      // Recent games
      prisma.leagueGame.findMany({
        select: {
          id: true,
          gameType: true,
          createdAt: true,
          recorder: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent leagues/tournaments
      prisma.league.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),

      // Recent events
      prisma.event.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_join' as const,
        message: `${user.name} joined the platform`,
        timestamp: new Date().toISOString(),
        user: user.name,
      })),
      ...recentGames.map(game => ({
        id: `game-${game.id}`,
        type: 'game_recorded' as const,
        message: `${game.gameType} game recorded`,
        timestamp: game.createdAt.toISOString(),
        user: game.recorder?.name || 'Unknown',
      })),
      ...recentLeagues.map(league => ({
        id: `league-${league.id}`,
        type: 'tournament_created' as const,
        message: `Tournament "${league.name}" created`,
        timestamp: league.createdAt.toISOString(),
        user: 'Admin',
      })),
      ...recentEvents.map(event => ({
        id: `event-${event.id}`,
        type: 'event_created' as const,
        message: `Event "${event.title}" scheduled`,
        timestamp: event.createdAt.toISOString(),
        user: 'Admin',
      })),
    ];

    // Sort by timestamp and take most recent 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activities.slice(0, 10);

    return NextResponse.json({ activity: recentActivity });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Dashboard activity error', error);
    return handleApiError(error);
  }
}
