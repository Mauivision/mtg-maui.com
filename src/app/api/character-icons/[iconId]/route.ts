import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { getCharacterIconPath } from '@/lib/character-sheet-icons';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ iconId: string }> }
) {
  const { iconId } = await params;
  const iconPath = getCharacterIconPath(iconId);
  if (!iconPath) {
    return new Response('Icon not found', { status: 404 });
  }

  try {
    const buffer = await fs.readFile(iconPath);
    const ext = path.extname(iconPath).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Icon file unavailable', { status: 404 });
  }
}
