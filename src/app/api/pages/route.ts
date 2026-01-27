import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';

/** Public API: editable page content for frontend. Controlled via Admin > Page Content. */
export async function GET() {
  try {
    const rows = await prisma.pageContent.findMany({
      orderBy: { path: 'asc' },
    });
    const pages = rows.map((p) => {
      let config: Record<string, unknown> = {};
      if (p.config) {
        try {
          config = JSON.parse(p.config) as Record<string, unknown>;
        } catch {
          /* leave config empty */
        }
      }
      return { path: p.path, title: p.title, description: p.description, config };
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}
