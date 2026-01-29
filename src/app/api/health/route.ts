import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public health check. No auth.
 * Use GET /api/health to verify Vercel Postgres (or any DB) is reachable.
 */
export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: true,
      database: 'connected',
      responseTimeMs: ms,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
