import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/deck-builder/:path*',
    '/tournaments/:path*',
    '/profile/:path*',
    '/players/:path*',
    '/stats/:path*',
    // Admin API routes may use simple-admin cookie or SKIP_ADMIN_AUTH; not NextAuth for panel UI
  ],
};
