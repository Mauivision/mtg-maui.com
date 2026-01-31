#!/usr/bin/env node
/**
 * Tests that localhost:3003 responds. Run while dev server is running.
 * Usage: npm run test:localhost
 */
const http = require('http');

const port = process.env.PORT || 3003;
const url = `http://localhost:${port}`;

const req = http.get(url, (res) => {
  const ok = res.statusCode >= 200 && res.statusCode < 400;
  if (ok) {
    console.log(`✓ localhost:${port} responded with ${res.statusCode}`);
    process.exit(0);
  } else {
    console.error(`✗ localhost:${port} returned ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`✗ Failed to reach localhost:${port}:`, err.message);
  console.error('  Make sure the dev server is running: npm run dev');
  process.exit(1);
});

req.setTimeout(15000, () => {
  req.destroy();
  console.error(`✗ localhost:${port} timed out`);
  process.exit(1);
});
