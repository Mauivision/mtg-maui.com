import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth-config';
import {
  verifySimpleAdminCookie,
  SIMPLE_ADMIN_COOKIE_NAME,
} from '@/lib/simple-admin-auth';

/**
 * Get the authenticated user from the server session
 * Throws an error if user is not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/**
 * Get the authenticated user ID from the server session
 * Returns null if not authenticated (non-throwing version)
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const user = await getAuthenticatedUser();
    return user.id;
  } catch {
    return null;
  }
}

/**
 * Middleware helper to check authentication in API routes
 * Returns the user if authenticated, or throws an error
 */
export async function requireAuth(request?: NextRequest) {
  const user = await getAuthenticatedUser();
  return user;
}

/**
 * Check if user has admin privileges
 * Uses Role-Based Access Control (RBAC) with fallback to ADMIN_USER_IDS
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const userRole = await prisma.userRole.findFirst({
      where: { userId, role: { name: 'admin' } },
      include: { role: true },
    });
    if (userRole) return true;
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    return adminUserIds.includes(userId);
  } catch (error) {
    console.error('Error checking admin role:', error);
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    return adminUserIds.includes(userId);
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const userRole = await prisma.userRole.findFirst({
      where: { userId, role: { name: roleName } },
    });
    return !!userRole;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Require admin access - throws if user is not admin
 */
export async function requireAdmin() {
  const user = await getAuthenticatedUser();
  const hasAdminAccess = await isAdmin(user.id);

  if (!hasAdminAccess) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

const SIMPLE_ADMIN_USER = {
  id: 'simple-admin',
  email: 'admin@mtg-maui.local',
  name: 'Admin',
};

/**
 * Require admin access via either NextAuth session or simple-admin cookie.
 * Use this in admin API routes. Pass the request so the cookie can be checked.
 * When SKIP_ADMIN_AUTH=true (e.g. dev / no-login mode), always allows access.
 * See docs/FUTURE_FEATURES.md to re-enable login.
 */
export async function requireAdminOrSimple(request: NextRequest) {
  if (process.env.SKIP_ADMIN_AUTH === 'true') {
    return SIMPLE_ADMIN_USER;
  }
  const cookie = request.cookies.get(SIMPLE_ADMIN_COOKIE_NAME)?.value;
  if (cookie && verifySimpleAdminCookie(cookie)) {
    return SIMPLE_ADMIN_USER;
  }
  return requireAdmin();
}

const ADMIN_EMAIL = 'admin@mtg-maui.com';

/**
 * Resolve User id for create operations when using simple-admin.
 * Returns the Admin user id (admin@mtg-maui.com) or null if not found.
 * Run prisma seed to ensure this user exists.
 */
export async function getAdminUserIdForCreates(): Promise<string | null> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const u = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true },
    });
    return u?.id ?? null;
  } catch {
    return null;
  }
}

/** Use when creating games/pairings/drafts with simple-admin; prefers real admin user id. */
export async function resolveRecordedByUserId(user: { id: string }): Promise<string> {
  if (user.id !== 'simple-admin') return user.id;
  const adminId = await getAdminUserIdForCreates();
  if (adminId) return adminId;
  throw new Error('Admin user not found. Run: npm run prisma:seed');
}
