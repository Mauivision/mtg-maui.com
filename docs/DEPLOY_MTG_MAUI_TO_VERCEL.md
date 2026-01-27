# Deploy mtg-maui.com from Local → Vercel & Take Over the Domain

Use this guide to **upload your local `mtg-maui.com` project** to Vercel and **point https://mtg-maui.com/** to it so Vercel controls the site (replacing the current “Index of /” hosting).

---

## Part 1: Deploy the Best Version from Your Local Folder

### 1.1 Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Vercel account](https://vercel.com/signup)
- Project builds successfully: run `npm run verify` in `mtg-maui.com`

### 1.2 One-time setup (if you haven’t used Vercel CLI here)

```bash
cd c:\Users\Aaron\All-Cursor-projects\mtg-maui.com
npm install
npx vercel login
```

Log in with your Vercel account when prompted.

### 1.3 Link this folder to a Vercel project (first time only)

```bash
npx vercel link
```

- **Set up and deploy?** Yes  
- **Which scope?** Your account  
- **Link to existing project?** No → **What’s your project’s name?** e.g. `mtg-maui-com`  
- **In which directory is your code?** `./` (default)

This creates a Vercel project and saves the link in `.vercel/project.json`.

### 1.4 Add environment variables in Vercel

Before deploying, set these in the [Vercel dashboard](https://vercel.com/dashboard):

1. Open your project → **Settings** → **Environment Variables**.
2. Add:

   | Name | Value | Environments |
   |------|--------|--------------|
   | `NEXTAUTH_URL` | `https://www.mtg-maui.com` | Production, Preview |
   | `NEXTAUTH_SECRET` | Long random string (e.g. `openssl rand -base64 32`) | Production, Preview |
   | `DATABASE_URL` | Your Postgres URL (Vercel Postgres or external) | Production, Preview |

For a quick first deploy you can use a placeholder `DATABASE_URL`; add a real DB and run `npx prisma migrate deploy` before using DB-dependent features.

### 1.5 Deploy from local (upload “best version”)

From your project root:

```bash
npm run verify
npm run deploy
```

Or, without the script:

```bash
npx vercel --prod
```

Vercel builds and deploys from your **local** folder. Your latest local code is what goes live.

### 1.6 Optional: Deploy from Git later

- Connect the same GitHub repo in the Vercel project (**Settings** → **Git**).
- Future pushes to `main` can auto-deploy. You can still use `npm run deploy` anytime to ship from local.

---

## Part 2: Point mtg-maui.com to Vercel (Vercel Controls the Domain)

Right now https://mtg-maui.com/ shows “Index of /” from your current host. To switch to Vercel:

### 2.1 Add domains in Vercel

1. Vercel project → **Settings** → **Domains**.
2. **Add**:
   - `www.mtg-maui.com`
   - `mtg-maui.com`
3. Vercel will show the DNS records you need.

### 2.2 Update DNS at your registrar

Where you manage DNS for `mtg-maui.com` (e.g. Namecheap, Cloudflare, GoDaddy, etc.):

1. **Remove or replace** existing A/CNAME records that point the domain to the current “Index of /” server.
2. **Add the records Vercel shows**, for example:
   - **`www`** → CNAME → `cname.vercel-dns.com` (or the exact target Vercel gives).
   - **Apex `mtg-maui.com`** → use Vercel’s recommended A records (e.g. `76.76.21.21`) or their apex CNAME if your provider supports it.

3. **Optional:** In Vercel **Domains**, set a **redirect**: `mtg-maui.com` → `https://www.mtg-maui.com` so both URLs work and canonical is `www`.

### 2.3 Wait for DNS and SSL

- Propagation often takes a few minutes up to 48 hours.
- Vercel auto-provisions SSL. When DNS is correct, https://mtg-maui.com and https://www.mtg-maui.com will serve your Next.js app.

### 2.4 Confirm

- Visit https://www.mtg-maui.com and https://mtg-maui.com.
- You should see the MTG Maui League app, not “Index of /”.

---

## Quick reference

| Step | Command or action |
|------|-------------------|
| Verify build | `npm run verify` |
| Deploy from local | `npm run deploy` or `npx vercel --prod` |
| Link project (first time) | `npx vercel link` |
| Env vars | Vercel → Project → Settings → Environment Variables |
| Domains | Vercel → Project → Settings → Domains |
| DNS | At your registrar; use the records Vercel provides |

---

## Summary

1. **Deploy:** Run `npm run verify` then `npm run deploy` from your local `mtg-maui.com` folder to push the best version to Vercel.  
2. **Env:** Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `DATABASE_URL` in Vercel.  
3. **Domains:** Add `www.mtg-maui.com` and `mtg-maui.com` in Vercel.  
4. **DNS:** Point both hostnames to Vercel at your registrar and remove old records for the previous host.  

After that, https://mtg-maui.com/ is controlled by Vercel and serves your deployed app.
