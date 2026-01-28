# 📁 MTG Maui League - Project Organization

## 🎯 **Clean & Organized Structure**

The project has been reorganized for better maintainability and deployment.

---

## 📂 Directory Structure

```
mtg-maui-league/
│
├── 📁 src/                          # Application source code
│   ├── app/                         # Next.js app router
│   │   ├── api/                     # API routes
│   │   ├── admin/                   # Admin pages
│   │   ├── leaderboard/             # Leaderboard pages
│   │   ├── auth/                    # Authentication pages
│   │   └── ...                      # Other pages
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
│   ├── schema.prisma                # Database schema
│   ├── seed.ts                      # Database seeding
│   └── dev.db                       # SQLite database (dev only)
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
- **Page:** `src/app/leaderboard/page.tsx`. Tabs: **Live Rankings** (RealtimeLeaderboard), **Detailed Stats** (table + filters), **Edit Scores** (EditableLeaderboardTable when a league is selected).
- **APIs:**
  - `GET /api/leaderboard/realtime` – Live rankings (optional `leagueId`, `gameType`, `limit`).
  - `GET /api/leagues/[leagueId]/leaderboard` – Traditional leaderboard for a league (used by Edit Scores).
  - `GET /api/leagues/status` – League status/stats (used by LeagueStatus component).
- **Populate:** `POST /api/admin/populate` – Seeds 16 players + sample games. Placements JSON uses `place` and `points` (matches leagues leaderboard API).

### **Admin dashboard**
- **`GET /api/admin/dashboard`** – Stats (users, games, leagues, events, db size, uptime). Db size from SQLite `prisma/dev.db` file size; other DBs → `N/A`.
- **`GET /api/admin/dashboard/activity`** – Recent users, games, leagues, events. Uses `logger` for errors.

### **Page content & app layout (control of other pages’ information)**
- **`PageContent`** (Prisma) – Per-path editable content: `path`, `title`, `description`, `config` (JSON). Seeded for `/`, `/leaderboard`, `/bulletin`, `/rules`, etc.
- **`GET /api/pages`** – Public API: returns all page content for the frontend. **`GET/PUT /api/admin/pages`** – Admin CRUD for page content.
- **`PageContentContext`** – Fetches `/api/pages`, exposes `getPage(path)`, `getConfig(path)`, `refresh()`. Used by layout (header/footer), home, leaderboard, bulletin.
- **Layout:** `Providers` → `LeagueProvider` → `PageContentProvider` → `children`. **Header** nav labels and **footer** blurb/quick links come from page config (`navLabel`, `footerBlurb`).
- **Wizards Control (Chaos League Tracker) → Page Content tab** – List pages, edit `title`, `description`, and `config` (JSON). `/admin` redirects to `/wizards`. Config can include `navLabel`, `heroSubtitle`, `heroHeadline`, `heroTagline`, `footerBlurb`, `exploreTitle`, `exploreSubtitle`, `features` (home), etc. Saving updates DB and calls `refresh()` so the app reflects changes immediately.
- **Pages using page content:** Home (hero, features, explore), Leaderboard (title, description), Bulletin (title, description), Header (nav labels), Footer (blurb, quick-link labels).

### **Editable data (tournaments, games, players, points, commanders)**
- **Where:** **Wizards Control** ([`/wizards`](http://localhost:3003/wizards)) and **Leaderboard → Edit Scores**.
- **What:** Players (name, email, commander), games (players, placements, points), events, news, drafts, scoring rules, page content, leaderboard (points/wins).
- **How:** See **[docs/EDITABLE_DATA_GUIDE.md](EDITABLE_DATA_GUIDE.md)** for step‑by‑step tasks, API reference, and data flow.

### **Components**
- **`LeagueStatus`** – Fetches `/api/leagues/status`, shows league stats.
- **`EditableLeaderboardTable`** – Fetches league leaderboard, double‑click to edit, save via `/api/admin/leaderboard/update`.
- **`RealtimeLeaderboard`** – Fetches realtime API, shows live rankings + activity.

### **After Restructure / Rebuild**
1. Run `npm install` (use `--legacy-peer-deps` if needed).
2. Run `npx prisma generate`.
3. Run `npm run build` to verify.
4. Populate sample data: `POST /api/admin/populate` (e.g. from a simple HTML page or Admin quick action).
5. Ensure a league exists and is selected for **Edit Scores** to work.

### **Database**
- **SQLite** (`prisma/dev.db`) by default. Admin dashboard `dbSize` uses `prisma/dev.db` file size; other DBs show `N/A`.

### **Run**
- `npm run dev` → dev server on port 3003. If `EADDRINUSE`, stop the process using 3003 or run `next dev -p 3004`.
- `npm run build` && `npm start` → production run.