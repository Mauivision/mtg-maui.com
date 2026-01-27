import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const body = await request.json();
    const { leagueId, gameType, placement, goldObjectives = 0, silverObjectives = 0 } = body;

    if (!leagueId || !gameType || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields: leagueId, gameType, placement' },
        { status: 400 }
      );
    }

    // Get scoring rules for this league and game type
    const scoringRules = await prisma.scoringRule.findMany({
      where: {
        leagueId,
        gameType,
        active: true,
      },
    });

    // Calculate points based on rules
    let totalPoints = 0;
    const breakdown = [];

    for (const rule of scoringRules) {
      let points = 0;

      switch (rule.name) {
        case 'Gold Objective':
          points = rule.points * goldObjectives;
          if (points > 0) breakdown.push({ rule: rule.name, points, count: goldObjectives });
          break;

        case 'Silver Objective':
          points = rule.points * silverObjectives;
          if (points > 0) breakdown.push({ rule: rule.name, points, count: silverObjectives });
          break;

        case `Placement ${placement}${placement === 1 ? 'st' : placement === 2 ? 'nd' : placement === 3 ? 'rd' : 'th'}`:
        case `Placement ${placement}`:
          points = rule.points;
          if (points > 0) breakdown.push({ rule: rule.name, points });
          break;
      }

      totalPoints += points;
    }

    // Add base participation points if not already included
    const hasParticipation = scoringRules.some(rule =>
      rule.name.toLowerCase().includes('participation')
    );
    if (!hasParticipation && totalPoints === 0) {
      // Add default participation points
      totalPoints = 1;
      breakdown.push({ rule: 'Participation', points: 1 });
    }

    return NextResponse.json({
      totalPoints,
      breakdown,
      rules: scoringRules.map(rule => ({
        name: rule.name,
        points: rule.points,
        description: rule.description,
      })),
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Scoring calculation error', error);
    return handleApiError(error);
  }
}
