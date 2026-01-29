import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { requireAdminOrSimple } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        memberships: true,
        games: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        allowedCardPools: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ leagues });
  } catch (error) {
    logger.error('Error fetching leagues', error);
    return handleApiError(error);
  }
}

const createLeagueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  format: z.string().min(1, 'Format is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  maxPlayers: z.number().int().positive().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createLeagueSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors.join('; ') || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { name, description, format, startDate, endDate, maxPlayers } = parsed.data;

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 });
    }
    let end: Date | null = null;
    if (endDate) {
      const e = new Date(endDate);
      if (!Number.isNaN(e.getTime())) end = e;
    }
    const league = await prisma.league.create({
      data: {
        name,
        description: description ?? undefined,
        format,
        startDate: start,
        endDate: end,
        maxPlayers: maxPlayers ?? 50,
        status: 'upcoming',
      },
      include: { memberships: true },
    });
    return NextResponse.json({ league }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating league', error);
    return handleApiError(error);
  }
}
