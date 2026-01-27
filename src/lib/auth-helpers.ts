import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth-config';

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
