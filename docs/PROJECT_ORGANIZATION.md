# 📁 Project Organization Guide

This document explains the organization structure of the MTG Maui League project.

## 🗂️ Directory Structure

```
mtg-maui.com/
├── 📄 Root Files (Essential Only)
│   ├── README.md              # Main project documentation
│   ├── package.json           # Dependencies and scripts
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vercel.json            # Vercel deployment config
│   └── .env.example           # Environment variables template
│
├── 📚 docs/                    # All Documentation
│   ├── README.md              # Documentation index
│   ├── DEPLOY_NOW.md          # Quick deployment guide
│   ├── VERCEL_QUICKSTART.md   # Vercel setup
│   ├── GITHUB_SETUP.md        # GitHub workflow
│   ├── PROJECT_STRUCTURE.md   # Architecture details
│   └── ...                    # Other documentation files
│
├── 🔧 scripts/                 # Utility Scripts
│   └── deploy-production.js   # Deployment automation
│
├── 🗄️ prisma/                  # Database
│   ├── schema.prisma          # Database schema
│   └── seed*.ts               # Seed scripts
│
├── 🎨 public/                  # Static Assets
│   ├── images/                # Image assets
│   ├── manifest.json          # PWA manifest
│   └── ...                    # Other static files
│
└── 💻 src/                     # Source Code
    ├── app/                   # Next.js App Router
    ├── components/            # React components
    ├── lib/                   # Utility libraries
    ├── types/                 # TypeScript types
    └── ...                    # Other source files
```

## 📋 Organization Principles

### ✅ **Root Directory - Keep Clean**
Only essential configuration files should be in the root:
- Configuration files (next.config.js, package.json, etc.)
- Main README.md
- Environment templates (.env.example)

### ✅ **Documentation - All in `docs/`**
All markdown documentation files go in the `docs/` folder:
- Deployment guides
- Setup instructions
- Project status documents
- Architecture documentation

### ✅ **Scripts - All in `scripts/`**
Utility and automation scripts:
- Deployment scripts
- Build scripts
- Database scripts

### ✅ **Source Code - All in `src/`**
All application code:
- Pages and routes
- Components
- Utilities and helpers
- Type definitions

## 🧹 Cleanup Checklist

When adding new files, ask:
1. **Is it documentation?** → `docs/`
2. **Is it a script?** → `scripts/`
3. **Is it source code?** → `src/`
4. **Is it a config file?** → Root (if essential)
5. **Is it temporary?** → Add to `.gitignore`

## 📝 File Naming Conventions

- **Documentation**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Scripts**: `kebab-case.js`
- **Components**: `PascalCase.tsx`
- **Utilities**: `kebab-case.ts`
- **Types**: `kebab-case.ts`

## 🚫 What NOT to Commit

- Build artifacts (`.next/`, `dist/`)
- Dependencies (`node_modules/`)
- Environment files (`.env.local`, `.env.production`)
- Temporary files (`*.tmp`, `*.bak`)
- Deployment packages (`*.zip`, `*.tar.gz`)

## 🔄 Maintenance

Keep the project clean by:
1. Regularly moving misplaced files to correct folders
2. Updating this guide when structure changes
3. Reviewing root directory periodically
4. Ensuring `.gitignore` is up to date
