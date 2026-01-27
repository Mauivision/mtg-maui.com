import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ news });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching news', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { title, excerpt, content, category, author } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category' },
        { status: 400 }
      );
    }

    const newsItem = await prisma.news.create({
      data: {
        title,
        excerpt,
        content,
        category,
        author: author || 'League Admin',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ news: newsItem }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error creating news', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, title, excerpt, content, category, author, publishedAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'News ID required' }, { status: 400 });
    }

    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        category,
        author,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });

    return NextResponse.json({ news: newsItem });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating news', error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('id');

    if (!newsId) {
      return NextResponse.json({ error: 'News ID required' }, { status: 400 });
    }

    await prisma.news.delete({
      where: { id: newsId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error deleting news', error);
    return handleApiError(error);
  }
}
