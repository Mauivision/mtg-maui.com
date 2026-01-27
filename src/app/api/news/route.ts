import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';




// Public endpoint to get news for homepage
export async function GET(request: NextRequest) {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10, // Limit to recent news
    });

    return NextResponse.json({ news });
  } catch (error) {
    logger.error('Error fetching news', error);
    return handleApiError(error);
  }
}
