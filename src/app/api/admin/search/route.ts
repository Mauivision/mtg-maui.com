import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'players';
    const query = searchParams.get('query') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    const results: any[] = [];

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    // Build order by
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder;

    if (type === 'players') {
      let whereClause: any = {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      };

      if (status) {
        whereClause.leagueMembers = {
          some: {
            active: status === 'active',
          },
        };
      }

      if (Object.keys(dateFilter).length > 0) {
        whereClause.createdAt = dateFilter;
      }

      const players = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          leagueMembers: {
            include: {
              _count: {
                select: {
                  registeredDecks: true,
                },
              },
            },
          },
        },
        orderBy,
        take: 50,
      });

      players.forEach(player => {
        const membership = player.leagueMembers[0];
        results.push({
          id: player.id,
          type: 'player',
          title: player.name,
          subtitle: player.email,
          metadata: {
            points: membership?._count?.registeredDecks || 0,
            games: membership?._count?.registeredDecks || 0,
            status: membership?.active ? 'active' : 'inactive',
          },
          lastModified: new Date().toISOString(), // No timestamp fields on User model
          status: membership?.active ? 'active' : 'inactive',
        });
      });
    }

    if (type === 'events') {
      let whereClause: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (status) {
        whereClause.status = status;
      }

      if (Object.keys(dateFilter).length > 0) {
        whereClause.date = dateFilter;
      }

      const events = await prisma.event.findMany({
        where: whereClause,
        orderBy,
        take: 50,
      });

      events.forEach(event => {
        results.push({
          id: event.id,
          type: 'event',
          title: event.title,
          subtitle: event.description,
          metadata: {
            date: event.date.toISOString().split('T')[0],
            participants: `${event.participants}/${event.maxParticipants}`,
            location: event.location || 'TBD',
          },
          lastModified: event.updatedAt?.toISOString() || event.createdAt.toISOString(),
          status: event.status,
        });
      });
    }

    if (type === 'games') {
      let whereClause: any = {};

      // Search in game type or notes
      if (query) {
        whereClause.OR = [
          { gameType: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (status) {
        // Map status to actual game states
        if (status === 'scheduled') {
          whereClause.date = { gte: new Date() };
        } else if (status === 'completed') {
          whereClause.placements = { not: '[]' };
        }
      }

      if (Object.keys(dateFilter).length > 0) {
        whereClause.date = { ...whereClause.date, ...dateFilter };
      }

      const games = await prisma.leagueGame.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              gameDecks: true,
            },
          },
        },
        orderBy,
        take: 50,
      });

      games.forEach(game => {
        results.push({
          id: game.id,
          type: 'game',
          title: `${game.gameType} Game`,
          subtitle: `Table ${game.tableNumber || 'TBD'}${game.round ? ` - Round ${game.round}` : ''}`,
          metadata: {
            date: game.date.toISOString().split('T')[0],
            participants: game._count.gameDecks,
            tournament: game.tournamentPhase || 'Regular',
          },
          lastModified: game.updatedAt?.toISOString() || game.createdAt.toISOString(),
          status: game.placements && game.placements !== '[]' ? 'completed' : 'scheduled',
        });
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Search error', error);
    return handleApiError(error);
  }
}
