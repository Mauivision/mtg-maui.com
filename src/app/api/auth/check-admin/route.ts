import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, isAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminStatus = await isAdmin(userId);
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
