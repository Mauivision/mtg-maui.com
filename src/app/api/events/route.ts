import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode } from '@/lib/static-league-data';

// Public endpoint to get events for homepage
export async function GET(request: NextRequest) {
  try {
    if (isStaticLeagueDataMode()) {
      return NextResponse.json({ events: [] });
    }
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ['upcoming', 'ongoing'],
        },
      },
      orderBy: { date: 'asc' },
      take: 10, // Limit to upcoming events
    });

    return NextResponse.json({ events });
  } catch (error) {
    logger.warn('Events DB unavailable; serving empty static events', {
      err: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ events: [], source: 'static-empty' as const });
  }
}
