import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

export const SIMPLE_ADMIN_COOKIE_NAME = 'mtg-admin';
const COOKIE_NAME = SIMPLE_ADMIN_COOKIE_NAME;
const DEFAULT_USER = 'Admin';
const DEFAULT_PASS = '12345';

function secret(): string {
  return process.env.ADMIN_SIMPLE_SECRET || 'mtg-maui-admin-secret';
}

function expectedToken(): string {
  return createHmac('sha256', secret()).update('simple-admin').digest('base64url');
}

export function verifySimpleAdminCookie(value: string | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    const expected = expectedToken();
    if (value.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(value, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

export function getSimpleAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_SIMPLE_USERNAME || DEFAULT_USER,
    password: process.env.ADMIN_SIMPLE_PASSWORD || DEFAULT_PASS,
  };
}

export function validateSimpleAdmin(username: string, password: string): boolean {
  const { username: u, password: p } = getSimpleAdminCredentials();
  return username === u && password === p;
}

export function setSimpleAdminCookie(res: NextResponse): NextResponse {
  const token = expectedToken();
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });
  return res;
}

export function clearSimpleAdminCookie(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

export function getSimpleAdminCookieFromHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1].trim()) : undefined;
}
