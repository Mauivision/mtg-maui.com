import { NextResponse } from 'next/server';
import { clearSimpleAdminCookie } from '@/lib/simple-admin-auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearSimpleAdminCookie(res);
  return res;
}
