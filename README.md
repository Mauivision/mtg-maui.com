# 🏰 MTG Maui League

**Magic: The Gathering Tournament League Management System**

A medieval fantasy-themed Next.js application for managing MTG tournaments with real-time leaderboards, editable scores, and comprehensive tournament features.

## 🚀 Deploy to Vercel

- **GitHub**: [Mauivision/mtg-maui.com](https://github.com/Mauivision/mtg-maui.com)
- **Vercel**: Import the repo → add env vars → Deploy. Custom domain: **www.mtg-maui.com**
- **Guides**: [docs/VERCEL_QUICKSTART.md](./docs/VERCEL_QUICKSTART.md) · [docs/DEPLOY_MTG_MAUI_TO_VERCEL.md](./docs/DEPLOY_MTG_MAUI_TO_VERCEL.md)

---

## ✨ Features

- **🏆 Real-time Leaderboard**: 16-player rankings with live updates
- **✏️ Editable Scores**: Double-click to edit tournament scores and stats
- **⚔️ Medieval Theme**: Immersive fantasy design perfect for MTG
- **📊 Admin Dashboard**: Complete tournament management system
- **🎮 Multiple Formats**: Support for Commander, Draft, and Standard
- **📱 Mobile Responsive**: Works beautifully on all devices

---

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Up Database**
```bash
npx prisma generate
npx prisma migrate dev
```

### **3. Run Development Server**
```bash
npm run dev
```

### **4. Open Application**
```
http://localhost:3003
```

---

## 📁 Project Structure

```
mtg-maui-league/
├── src/
│   ├── app/              # Next.js app router pages & API routes
│   ├── components/       # Reusable React components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions & configurations
│   ├── styles/           # Global CSS styles
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema & migrations
├── public/               # Static assets (images, icons, etc.)
├── docs/                 # Project documentation
├── scripts/              # Deployment & utility scripts
└── .cursorrules          # Cursor IDE project rules
```

---

## 🎯 Key Pages

- **Homepage**: `/` - Tournament info and league statistics
- **Leaderboard**: `/leaderboard` - Rankings with editable scores
- **Admin Panel**: `/admin` - Tournament management dashboard
- **Wizards Control**: `/wizards` - Advanced tournament controls
- **Character Sheets**: `/character-sheets` - Player profiles
- **Rules**: `/rules` - Tournament rules and formats

---

## 🗄️ Database

### **Schema**
- **Users**: Player accounts and authentication
- **Leagues**: Tournament leagues and seasons
- **Games**: Individual game records with scores
- **Decks**: Player deck registrations
- **Scoring Rules**: Configurable tournament scoring

### **Commands**
```bash
npx prisma studio          # Visual database editor
npx prisma migrate dev     # Create new migration
npx prisma db seed         # Seed test data
```

---

## 🎨 Theme & Design

### **Colors**
- **Primary**: Amber/Gold (`#f59e0b`, `#d97706`)
- **Secondary**: Slate/Stone (`#64748b`, `#475569`)
- **Accent**: Medieval red, green, purple

### **Fonts**
- **Headings**: Cinzel (medieval fantasy)
- **Body**: Inter (modern readability)

### **Icons**
- React Icons (Font Awesome) for consistent iconography
- Medieval-themed: crowns, shields, trophies

---

## 🚀 Deployment

### **Vercel (recommended)**
1. [vercel.com](https://vercel.com) → **New Project** → **Import Git Repository**
2. Select **Mauivision/mtg-maui.com**
3. Add **Environment Variables**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`
4. **Deploy**. Then add **www.mtg-maui.com** (and mtg-maui.com) under **Settings → Domains** and point HostGator DNS to Vercel.

See [docs/VERCEL_QUICKSTART.md](./docs/VERCEL_QUICKSTART.md) and [docs/DEPLOY_MTG_MAUI_TO_VERCEL.md](./docs/DEPLOY_MTG_MAUI_TO_VERCEL.md).

### **Environment variables**
```env
NEXTAUTH_URL=https://www.mtg-maui.com
NEXTAUTH_SECRET=your_random_secret_here
DATABASE_URL=your_postgres_or_placeholder_url
```

---

## 📚 Documentation

- **Vercel + custom domain**: [docs/VERCEL_QUICKSTART.md](./docs/VERCEL_QUICKSTART.md) · [docs/DEPLOY_MTG_MAUI_TO_VERCEL.md](./docs/DEPLOY_MTG_MAUI_TO_VERCEL.md)
- **Project structure**: [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)
- **Development workflow**: [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)

---

## 🛠️ Development Scripts

```bash
npm run dev              # Start development server (port 3003)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm run verify           # Type-check + lint + build
npm run deploy           # Deploy to Vercel (npx vercel --prod)
npm run prisma:studio    # Open Prisma Studio
```

---

## 🎮 MTG Tournament Features

### **Scoring System**
- **Gold Objectives**: 5 points each
- **Silver Objectives**: 2 points each
- **Placement Bonuses**: Configurable per league
- **Win/Loss Tracking**: Comprehensive statistics

### **Tournament Formats**
- **Commander**: Multiplayer format with legendary commanders
- **Draft**: Build decks from booster packs
- **Standard**: Modern Magic with latest sets

---

## 🏆 Players & Commanders

**16 Pre-loaded Players:**
- DragonMaster (The Ur-Dragon)
- SpellSlinger (Jace, the Mind Sculptor)
- CardShark (Thrasios, Triton Hero)
- ManaBurn (Chandra, Torch of Defiance)
- ArtifactLord (Urza, Lord High Artificer)
- GraveDigger (Meren of Clan Nel Toth)
- AngelWings (Kaalia of the Vast)
- ZombieKing (Chainer, Dementia Master)
- VampireLord (Edgar Markov)
- FishKing (Aesi, Tyrant of Gyre Strait)
- TreeBeard (Marath, Will of the Wild)
- WizardHat (Mizzix of the Izmagnus)
- JudgeHammer (Grand Arbiter Augustin IV)
- KrakenLord (Kumena, Tyrant of Orazca)
- GoblinKing (Krenko, Mob Boss)
- MaskMaster (Estrid, the Masked)

---

## 📦 Tech Stack

- **Framework**: Next.js 15.3.8 (React 18.2.0)
- **Database**: Prisma with SQLite/PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom medieval-themed components
- **Icons**: React Icons
- **Forms**: React Hook Form
- **Validation**: Zod

---

## 🔒 Security

- NextAuth.js for secure authentication
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection protection via Prisma
- Environment variable security

---

## 📝 License

© 2024 MTG Maui League. All rights reserved.

---

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord server

---

## 🎉 Ready to Deploy!

Your MTG Maui League is tournament-ready and optimized for production deployment on Vercel, Netlify, or any hosting platform.

**Get started**: `npm install && npm run dev` 🏰⚔️✨