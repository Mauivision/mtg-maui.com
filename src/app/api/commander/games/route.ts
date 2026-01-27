import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';




export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get Commander games with detailed participant data
    const games = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        totalPlayers: number;
        createdAt: string;
        winner: {
          id: string;
          name: string;
          commander: string;
        };
        players: Array<{
          id: string;
          name: string;
          commander: string;
          placement: number;
          points: number;
          knockouts: number;
          eliminatedBy?: string;
          lifeRemaining?: number;
        }>;
      }>
    >`
      SELECT
        lg.id,
        lg.name,
        lg.totalPlayers,
        lg.createdAt,
        JSON_OBJECT(
          'id', u.id,
          'name', u.name,
          'commander', lgp.commander
        ) as winner,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u2.id,
            'name', u2.name,
            'commander', lgp2.commander,
            'placement', lgp2.placement,
            'points', lgp2.points,
            'knockouts', COALESCE(JSON_LENGTH(lgp2.placements, '$.knockouts'), 0),
            'eliminatedBy', JSON_EXTRACT(lgp2.placements, '$.eliminatedBy'),
            'lifeRemaining', JSON_EXTRACT(lgp2.placements, '$.lifeRemaining')
          )
        ) as players
      FROM LeagueGame lg
      JOIN LeagueGameParticipant lgp ON lg.id = lgp.gameId
      JOIN User u ON lgp.playerId = u.id
      JOIN LeagueGameParticipant lgp2 ON lg.id = lgp2.gameId
      JOIN User u2 ON lgp2.playerId = u2.id
      WHERE lg.gameType = 'commander'
        AND lgp.placement = 1
      GROUP BY lg.id, lg.name, lg.totalPlayers, lg.createdAt, u.id, u.name, lgp.commander
      ORDER BY lg.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({ games });
  } catch (error) {
    logger.error('Commander games API error', error);
    return handleApiError(error);
  }
}

// Temporarily disabled due to build issues
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Endpoint temporarily disabled' }, { status: 503 });
}
