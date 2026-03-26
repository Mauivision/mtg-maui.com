const { execSync } = require('child_process');

function hasPostgresUrl() {
  const u = (process.env.DATABASE_URL || '').trim();
  return u.startsWith('postgresql://') || u.startsWith('postgres://');
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

// Vercel runs this at build time. If DATABASE_URL is missing, Prisma migrate deploy will fail.
// We still want the app to deploy (static JSON mode), so we only run migrations when a Postgres URL exists.
run('npx prisma generate');

if (hasPostgresUrl()) {
  run('npx prisma migrate deploy');
} else {
  console.warn(
    '[vercel-build] DATABASE_URL not set to Postgres; skipping prisma migrate deploy. ' +
      'Set DATABASE_URL in Vercel env vars to enable Supabase/DB mode.'
  );
}

run('npm run build');

