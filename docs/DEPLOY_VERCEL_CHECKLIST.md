# Vercel Deploy Checklist

Use this when deploying MTG Maui League to Vercel. One project only — **same** repo, **same** Vercel project; push to `main` overrides production.

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
- **Node:** 18.x (from `package.json` engines). Set in Vercel if needed: Project Settings → General → Node.js Version.
- **Build Command:** `npx prisma migrate deploy && npm run build` (from `vercel.json`).
- **Install Command:** `npm install`.

Ensure Project Settings → Build & Development match `vercel.json` or that overrides are off so the repo config is used.

## 4. Deploy (override production)

- **Same project:** Do **not** create a new Vercel project. Use your existing one (e.g. `mtg-maui-com`), connected to `Mauivision/mtg-maui.com`, branch `main`.
- Push to `main` → Vercel builds and deploys from `vercel.json`, **overriding** production.
- Or: Vercel → Deployments → **Redeploy** latest (use “Redeploy” on the correct deployment to override).
- **Optional:** Project Settings → General → name/description (e.g. "MTG Maui League").

## 5. Verify

1. **Database:**  
   `GET https://<your-domain>/api/health`  
   - **200** + `"database": "connected"` → Postgres is reachable.  
   - **503** → Check `DATABASE_URL` and Vercel Postgres.

2. **Wizards:**  
   Click **Edit** in the header (or open `/wizards`). If no league, click **Create League Tournament Records**. Then edit players, games, events.

3. **Home:**  
   Scroll to **Leaderboard** (points bar chart + rankings table), **Character Charts**, and **News Feed**; they use the same data from Wizards.

## 6. Live editing

- **Site:** One long-scroll **home** page (Hero, Leaderboard with chart + table, Character Charts, News Feed). **Wizards** (`/wizards`) is the only other page; use **Edit** in the header to open it.
- **Tables:** Edit via **Wizards** (Players, Games, Events, etc.). Leaderboard and Character Charts on the home page update when data changes.
- All edits persist in Vercel Postgres.
