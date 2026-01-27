import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, isAdmin } from '@/lib/auth-helpers';
import { verifySimpleAdminCookie, SIMPLE_ADMIN_COOKIE_NAME } from '@/lib/simple-admin-auth';

export async function GET(request: NextRequest) {
  try {
    const simpleCookie = request.cookies.get(SIMPLE_ADMIN_COOKIE_NAME)?.value;
    if (simpleCookie && verifySimpleAdminCookie(simpleCookie)) {
      return NextResponse.json({ isAdmin: true });
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminStatus = await isAdmin(userId);
    return NextResponse.json({ isAdmin: adminStatus });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
