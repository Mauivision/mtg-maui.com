import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { isStaticLeagueDataMode } from '@/lib/static-league-data';

const STATIC_NEWS = [
  {
    id: 'static-news-ronnie-lead-again',
    title: '!News Feed Reads!',
    excerpt: 'Oh no! Ronnie is in the Lead again!',
    category: 'League News',
    publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'static-news-third-draft-this-week',
    title: '3rd Draft this Week',
    excerpt: 'Get ready for some Chaos Draft! Wizards!',
    category: 'Announcements',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

// Public endpoint to get news for homepage
export async function GET(request: NextRequest) {
  try {
    if (isStaticLeagueDataMode()) {
      return NextResponse.json({ news: STATIC_NEWS });
    }
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ news });
  } catch (error) {
    logger.error('Error fetching news', error);
    if (isStaticLeagueDataMode()) {
      return NextResponse.json({ news: STATIC_NEWS });
    }
    return handleApiError(error);
  }
}
