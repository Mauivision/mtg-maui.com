import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple, resolveRecordedByUserId } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const drafts = await prisma.draftEvent.findMany({
      include: {
        pods: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching drafts', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminOrSimple(request);
    const creatorId = await resolveRecordedByUserId(user);

    const body = await request.json();
    const { name, format, date, maxParticipants } = body;

    if (!name || !format || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, format, date' },
        { status: 400 }
      );
    }

    const draft = await prisma.draftEvent.create({
      data: {
        name,
        format,
        date: new Date(date),
        maxParticipants: maxParticipants || 16,
        creatorId,
        status: 'upcoming',
      },
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating draft', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const body = await request.json();
    const { id, name, format, date, maxParticipants, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (format) updateData.format = format;
    if (date) updateData.date = new Date(date);
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (status) updateData.status = status;

    const draft = await prisma.draftEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating draft', error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
    }

    await prisma.draftEvent.delete({
      where: { id: draftId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting draft', error);
    return handleApiError(error);
  }
}
