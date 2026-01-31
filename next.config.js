/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'gatherer.wizards.com' },
      { protocol: 'https', hostname: '*.scryfall.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/leaderboard', destination: '/#leaderboard', permanent: true },
      { source: '/character-sheets', destination: '/#character-charts', permanent: true },
      { source: '/bulletin', destination: '/#news-feed', permanent: true },
      { source: '/admin', destination: '/wizards', permanent: true },
      { source: '/analytics', destination: '/', permanent: true },
      { source: '/commander', destination: '/', permanent: true },
      { source: '/rules', destination: '/', permanent: true },
      { source: '/coming-soon', destination: '/', permanent: true },
      { source: '/auth/signin', destination: '/', permanent: true },
      { source: '/auth/signup', destination: '/', permanent: true },
      { source: '/players/:path*', destination: '/', permanent: true },
      { source: '/tournaments/:path*', destination: '/', permanent: true },
    ];
  },
  // Removed custom jspdf webpack alias - it caused "Cannot read properties of undefined (reading 'call')"
  // jspdf uses default resolution. Re-add only if bundling issues occur.
};

module.exports = nextConfig;
