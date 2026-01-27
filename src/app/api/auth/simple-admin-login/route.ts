import { NextRequest, NextResponse } from 'next/server';
import {
  validateSimpleAdmin,
  setSimpleAdminCookie,
} from '@/lib/simple-admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!validateSimpleAdmin(username, password)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    setSimpleAdminCookie(res);
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
