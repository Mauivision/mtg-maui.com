import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



// Export all data
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    if (type === 'all' || type === 'players') {
      data.players = await prisma.user.findMany({
        include: {
          leagueMembers: {
            include: {
              league: true,
              registeredDecks: {
                include: {
                  gameResults: {
                    include: {
                      game: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (type === 'all' || type === 'games') {
      data.games = await prisma.leagueGame.findMany({
        include: {
          recorder: true,
          gameDecks: {
            include: {
              deck: {
                include: {
                  membership: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (type === 'all' || type === 'leagues') {
      data.leagues = await prisma.league.findMany({
        include: {
          memberships: {
            include: {
              user: true,
              registeredDecks: true,
            },
          },
          games: {
            include: {
              gameDecks: {
                include: {
                  deck: {
                    include: {
                      membership: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (type === 'all' || type === 'events') {
      data.events = await prisma.event.findMany();
    }

    // Add metadata
    data.exportedAt = new Date().toISOString();
    data.version = '1.0';
    data.type = type;

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mtg-maui-${type}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Export error', error);
    return handleApiError(error);
  }
}

// Import data
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    let data;

    try {
      data = JSON.parse(content);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    // Import logic would go here based on data structure
    // This is a simplified version

    let imported = { players: 0, games: 0, leagues: 0, events: 0 };

    // Import users if they exist
    if (data.players && Array.isArray(data.players)) {
      for (const player of data.players) {
        try {
          await prisma.user.upsert({
            where: { email: player.email },
            update: {
              name: player.name,
              // Don't update password on import
            },
            create: {
              name: player.name,
              email: player.email,
              password: '$2b$10$dummy.hash.for.import', // Would need to be reset
            },
          });
          imported.players++;
        } catch (error) {
          logger.error('Error importing player', error);
          // Continue with next player
        }
      }
    }

    // Import events if they exist
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        try {
          await prisma.event.create({
            data: {
              title: event.title,
              description: event.description,
              date: new Date(event.date),
              time: event.time,
              location: event.location,
              maxParticipants: event.maxParticipants || 32,
              status: event.status || 'upcoming',
              participants: event.participants || 0,
            },
          });
          imported.events++;
        } catch (error) {
          logger.error('Error importing event', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      message: `Imported ${imported.players} players, ${imported.events} events`,
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Import error', error);
    return handleApiError(error);
  }
}
