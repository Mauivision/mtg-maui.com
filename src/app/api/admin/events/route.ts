import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching events', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const body = await request.json();
    const { title, description, date, time, location, maxParticipants, imageUrl, status } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Missing required fields: title, date' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        maxParticipants: maxParticipants || 32,
        imageUrl,
        status: status || 'upcoming',
        participants: 0,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating event', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const body = await request.json();
    const {
      id,
      title,
      description,
      date,
      time,
      location,
      participants,
      maxParticipants,
      imageUrl,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        time,
        location,
        participants,
        maxParticipants,
        imageUrl,
        status,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating event', error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting event', error);
    return handleApiError(error);
  }
}
