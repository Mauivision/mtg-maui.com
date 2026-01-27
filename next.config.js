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
    ];
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    try {
      const path = require('path');
      const jspdfEs = path.join(
        path.dirname(require.resolve('jspdf/package.json')),
        'dist',
        'jspdf.es.min.js'
      );
      config.resolve.alias['jspdf'] = jspdfEs;
    } catch (_) {
      // jspdf not installed or path missing; use default
    }
    return config;
  },
};

module.exports = nextConfig;
