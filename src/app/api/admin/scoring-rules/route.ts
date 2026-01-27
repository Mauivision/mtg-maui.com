import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const querySchema = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  gameType: z.enum(['commander', 'draft', 'standard']).optional(),
});

const createScoringRuleSchema = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  gameType: z.enum(['commander', 'draft', 'standard']),
  name: z.string().min(1, 'Name is required'),
  points: z.number().int(),
  description: z.string().optional().nullable(),
});

const updateScoringRuleSchema = z.object({
  id: z.string().min(1, 'Scoring rule ID is required'),
  name: z.string().min(1).optional(),
  points: z.number().int().optional(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      leagueId: searchParams.get('leagueId'),
      gameType: searchParams.get('gameType') as 'commander' | 'draft' | 'standard' | undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] || 'Invalid query parameters' },
        { status: 400 }
      );
    }
    const { leagueId, gameType } = parsed.data;

    const scoringRules = await prisma.scoringRule.findMany({
      where: {
        leagueId,
        ...(gameType && { gameType }),
        active: true,
      },
      orderBy: [{ gameType: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ scoringRules });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching scoring rules', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const body = await request.json();
    const parsed = createScoringRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] || 'Invalid input' },
        { status: 400 }
      );
    }
    const { leagueId, gameType, name, points, description } = parsed.data;

    const scoringRule = await prisma.scoringRule.create({
      data: {
        leagueId,
        gameType,
        name,
        points,
        description,
        active: true,
      },
    });

    return NextResponse.json({ scoringRule });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating scoring rule', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const body = await request.json();
    const parsed = updateScoringRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] || 'Invalid input' },
        { status: 400 }
      );
    }
    const { id, name, points, description, active } = parsed.data;

    const scoringRule = await prisma.scoringRule.update({
      where: { id },
      data: {
        name,
        points,
        description,
        active,
      },
    });

    return NextResponse.json({ scoringRule });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating scoring rule', error);
    return handleApiError(error);
  }
}

const deleteScoringRuleSchema = z.object({
  id: z.string().min(1, 'Scoring rule ID is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);
    const { searchParams } = new URL(request.url);
    const parsed = deleteScoringRuleSchema.safeParse({ id: searchParams.get('id') });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] || 'Invalid query parameters' },
        { status: 400 }
      );
    }
    const { id: ruleId } = parsed.data;

    // Soft delete - mark as inactive
    await prisma.scoringRule.update({
      where: { id: ruleId },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting scoring rule', error);
    return handleApiError(error);
  }
}
