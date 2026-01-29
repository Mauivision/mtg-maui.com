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
- **Node:** 24.x (from `package.json` engines). Set in Vercel if needed: Project Settings → General → Node.js Version.
- **Build Command:** `npx prisma migrate deploy && npm run build` (from `vercel.json`).
- **Install Command:** `npm install`.

Ensure Project Settings → Build & Development match `vercel.json` or that overrides are off so the repo config is used.

## 4. Reconnect Vercel (after removing Git connection)

If you removed the Vercel ↔ GitHub connection, **reconnect** (don't create a new project):

1. **[Vercel Dashboard](https://vercel.com/dashboard)** → open your project (e.g. **mtg-maui-com**).
2. **Settings** → **Git**.
3. **Connect Git Repository** → choose **GitHub** → **Mauivision/mtg-maui.com**.
4. **Production Branch:** `main` → **Save**.
5. **Deployments** → **Redeploy** the latest deployment, or push a commit to `main` to trigger a new build.

Env vars (`DATABASE_URL`, etc.) and domain stay as before. Only the Git link is restored.

## 5. Deploy (override production)

- **Same project:** Use your existing Vercel project, connected to `Mauivision/mtg-maui.com`, branch `main`.
- Push to `main` → Vercel builds and deploys from `vercel.json`, **overriding** production.
- Or: Vercel → Deployments → **Redeploy** latest.
- **Optional:** Project Settings → General → name/description (e.g. "MTG Maui League").

## 6. Verify

1. **Database:**  
   `GET https://<your-domain>/api/health`  
   - **200** + `"database": "connected"` → Postgres is reachable.  
   - **503** → Check `DATABASE_URL` and Vercel Postgres.

2. **Wizards:**  
   Click **Edit** in the header (or open `/wizards`). If no league, click **Create League Tournament Records**. Then edit players, games, events.

3. **Home:**  
   Scroll to **Leaderboard** (points bar chart + rankings table), **Character Charts**, and **News Feed**; they use the same data from Wizards.

## 7. Live editing

- **Site:** One long-scroll **home** page (Hero, Leaderboard with chart + table, Character Charts, News Feed). **Wizards** (`/wizards`) is the only other page; use **Edit** in the header to open it.
- **Tables:** Edit via **Wizards** (Players, Games, Events, etc.). Leaderboard and Character Charts on the home page update when data changes.
- All edits persist in Vercel Postgres.

---

## 8. Why GitHub seems “messed up” or Vercel keeps showing the old version

### GitHub

- **Lots of branches** (`main`, `fix/*`, `vercel/*`, etc.): Normal. **Source of truth is `main`.** Vercel auto-created `vercel/*` branches; you can ignore or delete them. Don’t change Production to use those.
- **Local changes not on GitHub:** Commit and push. If you only changed files locally (e.g. Node 24, docs), GitHub still has the old state until you `git add` → `git commit` → `git push origin main`.

### Vercel shows old version

| Cause | What to do |
|-------|------------|
| **Builds failing** | New deploys never succeed, so the last **successful** (old) deploy stays live. Open **Deployments** → latest → **Build Logs**. Fix the error (e.g. Node version, `DATABASE_URL`, Prisma migrate, dependency install). |
| **Wrong Git connection** | Vercel is building from a **different repo** or **branch** than `Mauivision/mtg-maui.com` / `main`. **Settings → Git** → Connect `Mauivision/mtg-maui.com`, **Production Branch** = `main`. |
| **Production branch ≠ `main`** | Production might be set to `vercel/...` or another branch with old code. **Settings → Git** → set **Production Branch** to `main`. |
| **Redeploying the wrong deployment** | You hit “Redeploy” on an **old** deployment. Use **Redeploy** on the **latest** one (top of the list, from `main`). |
| **Browser / CDN cache** | You’re still seeing cached old assets. Hard refresh (`Ctrl+Shift+R`), or open the site in an **incognito** window. |
| **Node version mismatch** | `package.json` says `"node": "24.x"` but Vercel used 18. Set **Project Settings → General → Node.js Version** to **24.x**, or ensure no override; then redeploy. |

### Quick checks

1. **GitHub:** `main` has your latest commits (chart leaderboard, Node 24, etc.).  
2. **Vercel → Deployments:** Latest deployment is from `main`, commit matches. Build **succeeded** (green).  
3. **Vercel → Settings → Git:** Repo = `Mauivision/mtg-maui.com`, Production Branch = `main`.  
4. **Vercel → Settings → Environment Variables:** `DATABASE_URL` set for Production (and Preview if you use it).
