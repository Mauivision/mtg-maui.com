#!/usr/bin/env node

/**
 * Script to fix Prisma Client imports across all API routes
 * Replaces `new PrismaClient()` with singleton `prisma` from `@/lib/prisma`
 * 
 * Usage: npm run fix:prisma
 */

const fs = require('fs');
const path = require('path');

const API_ROUTES_DIR = path.join(__dirname, '..', 'src', 'app', 'api');

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixPrismaImports() {
  console.log('🔧 Fixing Prisma imports in API routes...\n');

  const routeFiles = findRouteFiles(API_ROUTES_DIR);
  let fixedCount = 0;
  let skippedCount = 0;
  let alreadyFixedCount = 0;

  for (const filePath of routeFiles) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const relativePath = path.relative(API_ROUTES_DIR, filePath);

      // Check if file uses new PrismaClient()
      if (content.includes('new PrismaClient()')) {
        // Replace import
        if (content.includes("import { PrismaClient } from '@prisma/client'")) {
          content = content.replace(
            /import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"];?\s*\n/g,
            "import { prisma } from '@/lib/prisma';\n"
          );
          modified = true;
        }

        // Replace const prisma = new PrismaClient();
        content = content.replace(
          /const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\s*\n/g,
          ''
        );
        modified = true;

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed: ${relativePath}`);
          fixedCount++;
        }
      } else if (content.includes("from '@/lib/prisma'") || content.includes('from "@/lib/prisma"')) {
        alreadyFixedCount++;
        skippedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixedCount} files`);
  console.log(`   ✓ Already using singleton: ${alreadyFixedCount} files`);
  console.log(`   ⏭️  Skipped: ${skippedCount - alreadyFixedCount} files (no Prisma usage)`);
  console.log(`\n🎉 Prisma import fixes complete!`);
}

// Run the script
try {
  fixPrismaImports();
} catch (error) {
  console.error('❌ Script failed:', error);
  process.exit(1);
}
