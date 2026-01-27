import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// Cancel upcoming events
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'cancel-upcoming': {
        // Cancel all events scheduled for the next 7 days
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();

        const result = await prisma.event.updateMany({
          where: {
            date: {
              gte: now,
              lte: sevenDaysFromNow,
            },
            status: {
              not: 'cancelled',
            },
          },
          data: {
            status: 'cancelled',
          },
        });

        return NextResponse.json({
          success: true,
          message: `Cancelled ${result.count} upcoming events`,
        });
      }

      case 'duplicate-month': {
        // Duplicate this month's events for next month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get events from this month
        const thisMonthEvents = await prisma.event.findMany({
          where: {
            date: {
              gte: new Date(currentYear, currentMonth, 1),
              lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
        });

        // Create next month's events
        let duplicated = 0;
        for (const event of thisMonthEvents) {
          const nextMonth = new Date(currentYear, currentMonth + 1, event.date.getDate());
          try {
            await prisma.event.create({
              data: {
                title: event.title,
                description: event.description,
                date: nextMonth,
                time: event.time,
                location: event.location,
                maxParticipants: event.maxParticipants,
                status: 'upcoming',
                participants: 0,
              },
            });
            duplicated++;
          } catch (error) {
            logger.error('Error duplicating event', error);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Duplicated ${duplicated} events for next month`,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Bulk events operation error', error);
    return handleApiError(error);
  }
}
