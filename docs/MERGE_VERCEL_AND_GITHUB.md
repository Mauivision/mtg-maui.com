# Merge to One Project — Vercel + GitHub

Use **one** project as the source of truth so Vercel serves the new build (chart leaderboard, etc.). Nothing changes on Vercel until you do the steps below.

---

## 1. Single project

- **Codebase:** `mtg-maui.com` (this folder)
- **GitHub:** `https://github.com/Mauivision/mtg-maui.com`
- **Vercel:** One project (e.g. `mtg-maui-com`) deploys **only** from that repo.

---

## 2. If you have two Vercel projects or two repos

**Option A – One repo, one Vercel project**

1. In **Vercel Dashboard** → **Projects** → open the project you want to keep (e.g. `mtg-maui-com`).
2. **Settings** → **Git**:
   - **Connect Git Repository:** `Mauivision/mtg-maui.com`.
   - **Production Branch:** `main`.
3. Remove or stop using any **other** Vercel project that used to deploy this app.
4. **Deployments** → **Redeploy** latest (or push to `main` to trigger a new deploy).

**Option B – Second repo exists (e.g. `mtg-maui-league`)**

1. Decide which repo is canonical. Use **`Mauivision/mtg-maui.com`** (this project).
2. In Vercel, **Settings** → **Git** → connect the project to **`Mauivision/mtg-maui.com`**, branch `main`.
3. Archiving or deleting the other repo avoids confusion. All work stays in `mtg-maui.com`.

---

## 3. Override production with this codebase

**Via Git (recommended)**

1. Ensure all work is committed and pushed to `main`:
   ```bash
   cd "C:\Users\Aaron\All-Cursor-projects\mtg-maui.com"
   git status
   git add -A && git commit -m "Merge: single project" && git push origin main
   ```
2. Vercel deploys from `main`. After the build finishes, production uses this codebase.

**Via Vercel CLI (override without Git)**

1. Log in and link:
   ```bash
   cd "C:\Users\Aaron\All-Cursor-projects\mtg-maui.com"
   npx vercel login
   npx vercel link
   ```
   When prompted, pick the **existing** Vercel project (e.g. `mtg-maui-com`).
2. Deploy to production:
   ```bash
   npx vercel --prod
   ```
   This deploys the **local** project and overrides the current production deployment.

---

## 4. Verify

1. Open your production URL (e.g. `https://mtg-maui-com.vercel.app`).
2. Hard refresh (`Ctrl+Shift+R`) or use an incognito window.
3. Confirm you see the **new** site (leaderboard with bar chart, compact table, etc.).

---

## 5. Summary

| Item | Use this |
|------|----------|
| **Repo** | `Mauivision/mtg-maui.com` |
| **Branch** | `main` |
| **Vercel project** | One project (e.g. `mtg-maui-com`) |
| **Git connection** | Vercel ↔ `Mauivision/mtg-maui.com`, `main` |

Once this is set, there is a single project; pushes to `main` update Vercel.
