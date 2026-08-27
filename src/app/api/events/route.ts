import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode } from '@/lib/static-league-data';
import { getDemoEvents } from '@/lib/league-hq/demo-data';

export async function GET(request: NextRequest) {
  try {
    if (isStaticLeagueDataMode()) {
      return NextResponse.json({ events: getDemoEvents(), source: 'season4-demo' as const });
    }
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ['upcoming', 'ongoing'],
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    return NextResponse.json({ events });
  } catch (error) {
    logger.warn('Events DB unavailable; serving Season 4 demo events', {
      err: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ events: getDemoEvents(), source: 'season4-demo' as const });
  }
}
