# Vercel Setup — MTG Maui League

Deploy the MTG Maui League site to Vercel. Two modes:

- **Static data** — No database. Shows 16 players, 4 pods from `league-data.json`. ~2 min setup.
- **Database** — Vercel Postgres. Full edit/CRUD via Wizards. ~5 min setup.

---

## Option A: Static data (show info, no DB)

1. **[vercel.com](https://vercel.com)** → **Add New** → **Project**
2. **Import** from GitHub → **Mauivision/mtg-maui.com**
3. **Environment variables:** Leave empty (or add `USE_STATIC_LEAGUE_DATA=true`).
4. **Build Command:** `prisma generate && npm run build` (default in `vercel.json`)
5. **Deploy**

Result: Home page shows leaderboard, character charts, and Wave 1 pod results using `src/data/league-data.json`.

---

## Option B: Database (full edit mode)

1. **Import project** from GitHub as above.
2. **Create database:** Project → **Storage** → **Create Database** → **Postgres**. Link to project.
3. **Environment variables:**
   - `DATABASE_URL` — auto-set by Vercel Postgres
   - `SKIP_ADMIN_AUTH` — `true` (optional, for no-login Wizards)
4. **Override build command** in Project Settings → Build & Development:
   ```bash
   npx prisma migrate deploy && prisma generate && npm run build
   ```
5. **Deploy** — migrations run during build.
6. **Seed data** (one-time): Use Vercel CLI locally with `DATABASE_URL` from project:
   ```bash
   npx vercel env pull .env.local
   npm run prisma:seed:maui
   ```

---

## Custom domain (www.mtg-maui.com)

1. Project → **Settings** → **Domains** → **Add** `www.mtg-maui.com`
2. Configure DNS per Vercel instructions (CNAME → `cname.vercel-dns.com`)
3. Add apex redirect: `mtg-maui.com` → `https://www.mtg-maui.com`

---

## Verify

- **Home:** https://your-app.vercel.app — Leaderboard, Character Charts, Pod Results
- **Wizards:** https://your-app.vercel.app/wizards — Edit (needs DB for full use)
- **Health:** https://your-app.vercel.app/api/health — `database: "connected"` only when DB is set
