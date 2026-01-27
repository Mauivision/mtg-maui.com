# 🏰 MTG Maui League

**Magic: The Gathering Tournament League Management System**

A medieval fantasy-themed Next.js application for managing MTG tournaments with real-time leaderboards, editable scores, and comprehensive tournament features.

## 🚀 **[READY TO DEPLOY → See docs/DEPLOY_NOW.md](./docs/DEPLOY_NOW.md)**

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

### **Vercel (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Auto-deploy with one click
4. See full guide: `docs/VERCEL_DEPLOYMENT.md`

### **Environment Variables**
```env
NODE_ENV=production
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=your_database_url_here
```

### **Other Options**
- **Netlify**: Good alternative with free tier
- **Railway**: Full-stack hosting with database
- **Traditional Hosting**: Use standalone HTML version

---

## 📚 Documentation

All documentation is now organized in the `/docs` folder:

- **Deployment**: `docs/DEPLOYMENT_GUIDE.md`
- **Vercel Setup**: `docs/VERCEL_DEPLOYMENT.md`
- **Admin Features**: `docs/ADMIN_FEATURES_SUMMARY.md`
- **Setup Guide**: `docs/SETUP_GUIDE.md`
- **Testing**: `docs/TESTING_CHECKLIST.md`

---

## 🛠️ Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm test                 # Run tests
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

- **Framework**: Next.js 15.3.3 (React 18.2.0)
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