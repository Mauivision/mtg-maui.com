# 📁 MTG Maui League - Project Structure

**Direction & controls:** See [DIRECTION_AND_CONTROLS.md](DIRECTION_AND_CONTROLS.md) for pages, offline vs online, and what you can edit.

## 🎯 **Layout**

- **Single home** (`/`): long-scroll with Hero, Leaderboard (points chart + rankings table), Character Charts, News Feed.
- **Wizards** (`/wizards`): edit panel. Old routes redirect (e.g. `/leaderboard` → `/#leaderboard`, `/admin` → `/wizards`).

---

## 📂 Directory Structure

```
mtg-maui-league/
│
├── 📁 src/                          # Application source code
│   ├── app/                         # Next.js app router
│   │   ├── api/                     # API routes
│   │   ├── page.tsx                 # Single long-scroll home (Hero, Leaderboard, Character Charts, News)
│   │   ├── wizards/                 # Edit panel (Wizards Control)
│   │   └── ...                      # error, not-found, globals
│   │
│   ├── components/                  # React components
│   │   ├── ui/                      # Base UI components
│   │   ├── admin/                   # Admin components
│   │   ├── leaderboard/             # Leaderboard components
│   │   ├── auth/                    # Auth components
│   │   └── ...                      # Other components
│   │
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility functions
│   ├── styles/                      # Global CSS
│   └── types/                       # TypeScript types
│
├── 📁 prisma/                       # Database
│   ├── schema.prisma                # Database schema (PostgreSQL)
│   ├── migrations/                  # Postgres migrations
│   └── seed.ts                      # Database seeding
│
├── 📁 public/                       # Static assets
│   ├── images/                      # Images
│   ├── icons/                       # Icons and favicons
│   ├── leaderboard-standalone.html  # Standalone version
│   └── manifest.json                # PWA manifest
│
├── 📁 docs/                         # Documentation
│   ├── DEPLOYMENT_GUIDE.md          # Deployment instructions
│   ├── SETUP_GUIDE.md               # Setup instructions
│   ├── ADMIN_FEATURES_SUMMARY.md    # Admin features
│   └── ...                          # Other documentation
│
├── 📁 scripts/                      # Utility scripts
│   ├── deploy-production.js         # Deployment script
│   └── generate-icons.js            # Icon generation
│
├── 📁 .github/                      # GitHub configs
│   └── workflows/                   # CI/CD workflows
│
├── 📄 Configuration Files
│   ├── next.config.js               # Next.js config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   ├── vercel.json                  # Vercel config
│   ├── .cursorrules                 # Cursor IDE rules
│   ├── .gitignore                   # Git ignore rules
│   ├── .vercelignore                # Vercel ignore rules
│   └── package.json                 # Dependencies
│
└── 📄 README.md                     # Main documentation
```

---

## 🗂️ What Changed

### **✅ Cleaned Up:**
- **50+ MD files** → Moved to `/docs` folder
- **Large ZIP files** → Removed (200MB+ each)
- **Deployment folder** → Removed duplicate
- **Temporary files** → Deleted (populate-db.js, test files)
- **Build artifacts** → Added to .gitignore

### **✅ Organized:**
- **Documentation** → `/docs` folder
- **Scripts** → `/scripts` folder
- **Source code** → `/src` folder
- **Database** → `/prisma` folder
- **Static assets** → `/public` folder

### **✅ Optimized:**
- **Reduced project size** from 400MB+ to ~20MB
- **Clean git repository** without build artifacts
- **Proper .vercelignore** for deployment
- **Updated .gitignore** for large files

---

## 📦 Deployment Package

### **For Vercel:**
- Only source files are deployed
- No documentation or test files
- Minimal deployment size (~5MB)

### **For Traditional Hosting:**
- Use `public/leaderboard-standalone.html`
- Self-contained, no build required
- Works on any web server

---

## 🎯 Core Files (Essential)

### **Configuration:**
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Deployment configuration

### **Application:**
- `/src` - All application code
- `/prisma` - Database schema
- `/public` - Static assets

### **Documentation:**
- `README.md` - Main documentation
- `/docs` - Detailed guides

---

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Database management
npx prisma studio
```

---

## 📊 Project Size

**Before Cleanup:**
- Total: ~600MB+
- ZIP files: 400MB+
- Deployment folder: 150MB+

**After Cleanup:**
- Total: ~20MB
- Essential files only
- Deployment ready

---

## ✨ Result

Your MTG Maui League project is now:
- **Clean & Organized** - Logical folder structure
- **Deployment Ready** - Optimized for Vercel
- **Well Documented** - Clear guides in `/docs`
- **Small & Fast** - Minimal deployment size

**Ready to import into Vercel!** 🏆⚔️✨

---

## 🔧 Conventions & Key Modules (Post‑Rebuild)

### **`src/lib`**
- **`prisma`** – Shared Prisma client (use `prisma` from `@/lib/prisma`, not `new PrismaClient()`).
- **`api-error`** – `handleApiError(error)`, `ApiError`, `apiSuccess()`. Use in API routes for consistent error responses.
- **`logger`** – `logger.info()`, `logger.warn()`, `logger.error()`, `logger.performance()`. Use instead of `console.*` in API routes (100% migrated).
- **`api-middleware`** – `withLogging()`, `measureTime()`. Optional wrappers for request/response logging.
- **`auth-helpers`** – `requireAdmin()`, session helpers for API routes.

### **`src/types`**
- **`leaderboard`** – `TraditionalLeaderboardEntry`, `ScoringRules`, `PlayerGameHistory`, `RealtimeLeaderboardEntry`, etc.
- **`league`** – League, membership, and related types.

### **Leaderboard**
- **Home** (`/`): **Leaderboard** section uses `RealtimeLeaderboard` + `LeagueStatus`. **Character Charts** use `/api/leagues/[id]/character-sheets`. **News Feed** uses `/api/news` and `/api/events`.
- **APIs:** `GET /api/leaderboard/realtime`, `GET /api/leagues/[leagueId]/leaderboard`, `GET /api/leagues/status`, `GET /api/leagues/[leagueId]/character-sheets`, `GET /api/news`, `GET /api/events`.
- **Populate:** `POST /api/admin/populate` (from Wizards) – seeds league, 16 players, sample games.

### **Admin dashboard**
- **`GET /api/admin/dashboard`** – Stats (users, games, leagues, events, db size, uptime). Db size: N/A for Postgres; was SQLite file size when using `dev.db`.
- **`GET /api/admin/dashboard/activity`** – Recent users, games, leagues, events. Uses `logger` for errors.

### **Page content & layout** (see [DIRECTION_AND_CONTROLS](DIRECTION_AND_CONTROLS.md))
- **`PageContent`** (Prisma) – Per-path editable content: `path`, `title`, `description`, `config` (JSON). Seeded for `/`, `/leaderboard`, `/bulletin`, `/rules`, etc.
- **`GET /api/pages`** – Public API: returns all page content for the frontend. **`GET/PUT /api/admin/pages`** – Admin CRUD for page content.
- **`PageContentContext`** – Fetches `/api/pages`, exposes `getPage(path)`, `getConfig(path)`, `refresh()`. Used by layout (header/footer), home, leaderboard, bulletin.
- **Layout:** `Providers` → `LeagueProvider` → `PageContentProvider` → `children`. **Header** nav labels and **footer** blurb/quick links come from page config (`navLabel`, `footerBlurb`).
- **Wizards Control (Chaos League Tracker) → Page Content tab** – List pages, edit `title`, `description`, and `config` (JSON). `/admin` redirects to `/wizards`. Config can include `navLabel`, `heroSubtitle`, `heroHeadline`, `heroTagline`, `footerBlurb`, `exploreTitle`, `exploreSubtitle`, `features` (home), etc. Saving updates DB and calls `refresh()` so the app reflects changes immediately.
- **Pages using page content:** Home (hero, features, explore), Leaderboard (title, description), Bulletin (title, description), Header (nav labels), Footer (blurb, quick-link labels).

### **Editable data**
- **Where:** **Wizards** (`/wizards`). Home shows Leaderboard, Character Charts, News Feed from the same data.
- **What:** Leagues, players, games, events, news, drafts, scoring rules, page content. See **[EDITABLE_DATA_GUIDE.md](EDITABLE_DATA_GUIDE.md)**.

### **Components**
- **`LeagueStatus`** – `/api/leagues/status`; used in home Leaderboard section.
- **`RealtimeLeaderboard`** – `/api/leaderboard/realtime`; used in home Leaderboard section.
- **`EditableLeaderboardTable`** – Used in Wizards (leaderboard tab); save via `/api/admin/leaderboard/update`.

### **After clone / rebuild**
1. `npm install` · `npx prisma generate` · `npm run build`.
2. Set `DATABASE_URL` (Postgres). See [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md).
3. `npx prisma migrate dev` · `npx prisma db seed` (optional).
4. `npm run dev` → open `/`, then **Edit** → Wizards. Use **Create League Tournament Records** if no league.

### **Database**
- **PostgreSQL** via `DATABASE_URL`. See [Vercel Postgres Setup](VERCEL_POSTGRES_SETUP.md). Admin dashboard `dbSize` shows N/A for Postgres.

### **Run**
- `npm run dev` → dev server on port 3004. If `EADDRINUSE`, stop the process using 3004 or run `npm run dev:alt` (port 3003).
- `npm run build` && `npm start` → production run.