# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

This is a single Next.js 15 application (not a monorepo) with PostgreSQL as the only external dependency. All API routes are built into Next.js under `src/app/api/`.

| Service | How to run |
|---------|-----------|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` (must be running before the app) |
| Next.js dev server | `npm run dev` → http://localhost:3003 |

### Database setup

PostgreSQL must be running before the dev server. The database is configured via `DATABASE_URL` in `.env`. If starting fresh:

```bash
sudo -u postgres psql -c "CREATE USER mtguser WITH PASSWORD 'mtgpass' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE mtg_maui OWNER mtguser;"
npx prisma migrate deploy
DATABASE_URL="postgresql://mtguser:mtgpass@localhost:5432/mtg_maui" npm run prisma:seed:maui
```

### Gotchas

- **BOM in migration file**: The initial migration (`prisma/migrations/20260126120000_init_postgres/migration.sql`) originally had a UTF-8 BOM that PostgreSQL cannot parse. This has been fixed in the repo. If you encounter `syntax error at or near "﻿"` during migration, strip the BOM.
- **Seed scripts don't load `.env`**: The `ts-node` seed scripts (e.g. `npm run prisma:seed:maui`) do not automatically load `.env`. You must either export `DATABASE_URL` or prefix the command: `DATABASE_URL="..." npm run prisma:seed:maui`.
- **Leaderboard query error**: The homepage leaderboard may show a Prisma `queryRaw` error about `relation "leaguegamedeck" does not exist`. This is a known issue with the raw SQL query referencing a view/table not created by migrations. The Points chart and character cards still render correctly with seeded data.
- **Static data mode**: Set `USE_STATIC_LEAGUE_DATA=true` in `.env` (and omit `DATABASE_URL`) to run without a database. This provides read-only demo data from `src/data/league-data.json`.
- **Auth is off by default**: `SKIP_ADMIN_AUTH=true` in `.env` means the Wizards admin panel is open without login.

### Standard commands

See `README.md` for the full script reference. Key ones:

- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Build: `npm run build`
- Dev server: `npm run dev` (port 3003)
- Full verify: `npm run verify` (type-check + lint + build)
