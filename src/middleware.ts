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
    '/admin/:path*',
    '/wizards/:path*',
  ],
};
