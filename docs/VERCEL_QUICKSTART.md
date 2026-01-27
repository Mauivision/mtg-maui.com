# Vercel Deployment & Custom Domain (www.mtg-maui.com)

This project is configured for **Vercel only**. GitHub Pages is not used (it cannot run API routes).

**→ Deploy from your local folder and point mtg-maui.com to Vercel:** see [DEPLOY_MTG_MAUI_TO_VERCEL.md](./DEPLOY_MTG_MAUI_TO_VERCEL.md).

---

## 1. Deploy to Vercel

1. **Import from GitHub**
   - [vercel.com](https://vercel.com) → **New Project** → **Import Git Repository**
   - Select your `mtg-maui.com` repo.

2. **Configure**
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - Root directory: leave default.

3. **Environment variables** (add before first deploy):

   | Name | Value | Required |
   |------|--------|----------|
   | `NEXTAUTH_URL` | `https://www.mtg-maui.com` | Yes (after adding domain) |
   | `NEXTAUTH_SECRET` | Long random string | Yes |
   | `DATABASE_URL` | Postgres connection string | Yes for DB features |

   For initial deploy without a DB, you can use a placeholder `DATABASE_URL`; some features will fail until you add a real Postgres DB (e.g. Vercel Postgres).

4. **Deploy**  
   Click **Deploy**. Vercel will build and host the app.

---

## 2. Custom domain: www.mtg-maui.com

1. **Vercel project** → **Settings** → **Domains**.

2. **Add domain**
   - Add `www.mtg-maui.com`.
   - Vercel shows DNS records (CNAME or A).

3. **Configure DNS** (at your registrar, e.g. Namecheap, Cloudflare, etc.)
   - For `www`: CNAME `www` → `cname.vercel-dns.com` (or the value Vercel shows).
   - For apex `mtg-maui.com`: either use Vercel’s apex config (A/CNAME they provide) or redirect apex → `www` at the DNS/provider level if supported.

4. **Redirect apex → www (optional)**  
   In Vercel **Domains**:
   - Add `mtg-maui.com` as well.
   - Set **Redirect** so `mtg-maui.com` → `https://www.mtg-maui.com`.

5. **SSL**  
   Vercel provisions certificates automatically once DNS is correct.

6. **Update env**
   - Set `NEXTAUTH_URL=https://www.mtg-maui.com`.
   - Redeploy if you change env vars.

---

## 3. Database (production)

- Use **Vercel Postgres** (Storage → Create Database) or another Postgres host.
- Set `DATABASE_URL` in project env.
- Run migrations (e.g. locally or in a one-off script):

  ```bash
  npx prisma migrate deploy
  ```

- Optionally seed:

  ```bash
  npm run prisma:seed
  ```

---

## 4. Post-deploy checklist

- [ ] Repo connected to Vercel, deploys on push to `main`
- [ ] `NEXTAUTH_URL` and `NEXTAUTH_SECRET` set
- [ ] `www.mtg-maui.com` added and DNS configured
- [ ] (Optional) `mtg-maui.com` → `www.mtg-maui.com` redirect
- [ ] `DATABASE_URL` set and migrations run
- [ ] Site loads at `https://www.mtg-maui.com`

---

## 5. CI (GitHub)

The **CI** workflow (`.github/workflows/ci.yml`) runs `npm run verify` on push/PR to `main`. It does not deploy; Vercel deploys via Git integration.

---

**Live URLs (after domain config):**

- **Home**: https://www.mtg-maui.com  
- **Leaderboard**: https://www.mtg-maui.com/leaderboard  
- **Admin**: https://www.mtg-maui.com/admin  
