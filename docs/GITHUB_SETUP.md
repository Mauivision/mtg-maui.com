# 🐙 GitHub Repository Setup

## ✅ **Setup Your GitHub Repository**

Follow these steps to get your MTG Maui League on GitHub for Vercel deployment.

---

## 📋 **Step-by-Step Guide**

### **Step 1: Create GitHub Repository**

1. **Go to [github.com](https://github.com)**
2. **Click the "+" icon** in top right → "New repository"
3. **Repository settings:**
   - **Name**: `mtg-maui-league` (or your choice)
   - **Description**: "MTG Maui League - Tournament Management System"
   - **Visibility**: Public or Private (your choice)
   - **⚠️ DO NOT** initialize with README, .gitignore, or license
4. **Click "Create repository"**

### **Step 2: Connect Your Local Project**

Copy the repository URL from GitHub (looks like):
```
https://github.com/YOUR_USERNAME/mtg-maui-league.git
```

Then run these commands:

```bash
# Set your GitHub repository as remote
git remote set-url origin https://github.com/YOUR_USERNAME/mtg-maui-league.git

# Push your code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

### **Step 3: Verify Upload**

1. **Refresh your GitHub repository page**
2. **You should see all your files**
3. **Ready for Vercel deployment!**

---

## 🚀 **Quick Commands**

### **If You Need to Create First Commit:**
```bash
git add .
git commit -m "Initial commit: MTG Maui League tournament system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mtg-maui-league.git
git push -u origin main
```

### **If Remote Already Exists:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/mtg-maui-league.git
git push -u origin main
```

---

## 🔍 **Verify Your Setup**

### **Check Current Remote:**
```bash
git remote -v
```

**Should show:**
```
origin  https://github.com/YOUR_USERNAME/mtg-maui-league.git (fetch)
origin  https://github.com/YOUR_USERNAME/mtg-maui-league.git (push)
```

### **Check Git Status:**
```bash
git status
```

**Should show:**
```
On branch main
nothing to commit, working tree clean
```

---

## ⚠️ **Common Issues**

### **"Repository not found"**
- Make sure the repository exists on GitHub
- Check your username is correct in the URL
- Verify you have push access

### **Authentication Failed**
- Use Personal Access Token instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Generate new token with `repo` scope
- Use token as password when pushing

### **Remote Already Exists**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/mtg-maui-league.git
```

---

## 📦 **What Gets Uploaded**

### **Included:**
✅ Source code (`/src`)
✅ Database schema (`/prisma`)
✅ Configuration files
✅ Static assets (`/public`)
✅ Documentation (`/docs`)
✅ README.md

### **Excluded** (via .gitignore):
❌ node_modules/
❌ .next/
❌ *.zip files
❌ deployment folder
❌ .env files
❌ Large database files

---

## 📄 **GitHub Pages (optional)**

A minimal **static landing page** lives in `docs/index.html`. It shows “MTG Maui League” and a link to your live app.

**To use it at e.g. `https://mauivision.github.io/mtg-maui.com/`:**

1. GitHub repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. **Branch:** `main` (or default) → **Folder:** `/docs` → **Save**.
4. After a minute, the site will be at `https://<org-or-user>.github.io/<repo>/`.

**Edit the live link:** In `docs/index.html`, change the `href` in the “Open live site” button to your real Vercel URL (e.g. `https://your-app.vercel.app` or your custom domain).

---

## 🎯 **Next Step: Vercel**

Once your code is on GitHub:

1. **Go to Vercel**
2. **Import from GitHub**
3. **Select your repository**
4. **Deploy automatically!**

See [DEPLOY_VERCEL_CHECKLIST.md](DEPLOY_VERCEL_CHECKLIST.md) for Vercel deployment.

---

## ✨ **Success!**

Your MTG Maui League is now on GitHub and ready for professional deployment! 🏆⚔️