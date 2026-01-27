import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    // Basic health check
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Get basic stats
    const [userCount, gameCount, leagueCount] = await Promise.all([
      prisma.user.count(),
      prisma.leagueGame.count(),
      prisma.league.count(),
    ]);

    // Mock server load (would use actual system monitoring)
    const load = Math.floor(Math.random() * 30) + 10; // 10-40%

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
      },
      stats: {
        users: userCount,
        games: gameCount,
        leagues: leagueCount,
      },
      load: `${load}%`,
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Health check error', error);
    return handleApiError(error);
  }
}
