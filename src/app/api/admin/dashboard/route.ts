import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

/** DB size: SQLite file (dev.db) when local; Postgres etc. show N/A. */
async function getDbSize(): Promise<string> {
  const url = process.env.DATABASE_URL ?? '';
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'N/A';
  }
  try {
    const path = await import('path');
    const fs = await import('fs/promises');
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const stat = await fs.stat(dbPath);
    const mb = stat.size / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(stat.size / 1024)} KB`;
  } catch {
    return 'N/A';
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const [totalUsers, activeUsers, totalGames, totalTournaments, totalEvents, dbSize] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count(),
        prisma.leagueGame.count(),
        prisma.league.count(),
        prisma.event.count(),
        getDbSize(),
      ]);

    const uptime = process.uptime
      ? `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`
      : 'Unknown';

    const serverLoad = Math.floor(Math.random() * 100);

    const stats = {
      totalUsers,
      activeUsers,
      totalGames,
      totalTournaments,
      totalEvents,
      dbSize,
      uptime,
      serverLoad,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Dashboard stats error', error);
    return handleApiError(error);
  }
}
