# Vercel Deploy Checklist

Use this when deploying MTG Maui League to Vercel so the site works with live editable tables and charts.

## 1. Database (required)

- **Vercel Postgres:** Project → Storage → Create Database → Postgres. Link it to your project.
- **`DATABASE_URL`** is auto-injected. Ensure it exists under Settings → Environment Variables for Production (and Preview if you use it).

See [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md) for details.

## 2. Environment variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | (from Vercel Postgres) | Required. Postgres connection. |
| `SKIP_ADMIN_AUTH` | `true` | No-login mode: Wizards and admin APIs work without sign-in. Omit to require login (see [FUTURE_FEATURES.md](FUTURE_FEATURES.md)). |

Optional: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, etc. for auth when you re-enable it.

## 3. Build settings

- **Framework:** Next.js (auto-detected).
- **Build Command:** `npx prisma migrate deploy && npm run build` (from `vercel.json`).
- **Install Command:** `npm install`.

Ensure Project Settings → Build & Development match `vercel.json` or that overrides are off so the repo config is used.

## 4. Deploy

- Push to your connected Git branch (e.g. `main`). Vercel builds and deploys.
- Or: Deployments → Redeploy.

## 5. Verify

1. **Database:**  
   `GET https://<your-domain>/api/health`  
   - **200** + `"database": "connected"` → Postgres is reachable.  
   - **503** → Check `DATABASE_URL` and Vercel Postgres.

2. **Wizards:**  
   Open `/wizards`. If no league, click **Create League Tournament Records**. Then edit players, games, events.

3. **Leaderboard:**  
   Open `/leaderboard`. Use **Edit Scores** to change placements/points. Charts update when you refresh or when polling runs.

## 6. Live editing

- **Tables:** Edit via **Wizards** (Players, Games, Events, etc.) and **Leaderboard → Edit Scores**.
- **Charts:** Data comes from the same DB. Edit in Wizards → leaderboard/analytics charts update on refetch.
- All edits persist in Vercel Postgres.
