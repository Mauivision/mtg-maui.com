import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrSimple } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const rows = await prisma.pageContent.findMany({
      orderBy: { path: 'asc' },
    });
    const pages = rows.map((p) => ({
      id: p.id,
      path: p.path,
      title: p.title,
      description: p.description,
      config: p.config ? (JSON.parse(p.config) as Record<string, unknown>) : {},
      updatedAt: p.updatedAt,
    }));
    return NextResponse.json({ pages });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error fetching page content', error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminOrSimple(request);

    const body = await request.json();
    const { path, title, description, config } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    const configStr = config != null ? JSON.stringify(config) : undefined;
    const updated = await prisma.pageContent.upsert({
      where: { path },
      update: {
        ...(title !== undefined && { title: title ?? null }),
        ...(description !== undefined && { description: description ?? null }),
        ...(configStr !== undefined && { config: configStr }),
      },
      create: {
        path,
        title: title ?? null,
        description: description ?? null,
        config: configStr ?? null,
      },
    });

    return NextResponse.json({
      page: {
        id: updated.id,
        path: updated.path,
        title: updated.title,
        description: updated.description,
        config: updated.config ? (JSON.parse(updated.config) as Record<string, unknown>) : {},
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden'))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    logger.error('Error updating page content', error);
    return handleApiError(error);
  }
}
