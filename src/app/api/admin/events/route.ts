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

    // Also post to the news reel so the event appears on the homepage
    const excerpt =
      typeof description === 'string' && description.trim()
        ? description.trim().slice(0, 200) + (description.length > 200 ? '…' : '')
        : null;
    const details = [time, location].filter(Boolean).join(' · ');
    const newsTitle = details ? `${title} — ${details}` : title;
    try {
      await prisma.news.create({
        data: {
          title: newsTitle,
          excerpt: excerpt ?? (details ? `Upcoming event: ${title}` : undefined),
          content: description || undefined,
          category: 'Announcements',
          author: 'League',
          publishedAt: new Date(date),
        },
      });
    } catch (newsErr) {
      logger.warn('Event created but news post failed', { error: String(newsErr) });
      // Event is still created; don't fail the request
    }

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
