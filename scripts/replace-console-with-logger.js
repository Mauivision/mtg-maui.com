#!/usr/bin/env node

/**
 * Script to replace console.log/error/warn with logger in API routes
 * This is a helper script for bulk replacement
 * 
 * Usage: node scripts/replace-console-with-logger.js [file-path]
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

function replaceConsoleInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const relativePath = path.relative(API_ROUTES_DIR, filePath);

    // Check if logger is already imported
    const hasLoggerImport = content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');
    
    // Add logger import if not present and file uses console
    if (!hasLoggerImport && (content.includes('console.log') || content.includes('console.error') || content.includes('console.warn'))) {
      // Find the last import statement
      const importMatch = content.match(/(import\s+.*?from\s+['"].*?['"];?\s*\n)+/);
      if (importMatch) {
        const lastImportIndex = importMatch[0].lastIndexOf('\n');
        const insertIndex = importMatch.index + lastImportIndex + 1;
        content = content.slice(0, insertIndex) + "import { logger } from '@/lib/logger';\n" + content.slice(insertIndex);
        modified = true;
      }
    }

    // Replace console.error with logger.error
    if (content.includes('console.error')) {
      content = content.replace(
        /console\.error\((['"`])(.*?)\1\s*,\s*(.*?)\);?/g,
        "logger.error('$2', $3);"
      );
      // Handle console.error without message
      content = content.replace(
        /console\.error\((.*?)\);?/g,
        "logger.error('Error', $1);"
      );
      modified = true;
    }

    // Replace console.log with logger.info
    if (content.includes('console.log')) {
      content = content.replace(
        /console\.log\((['"`])(.*?)\1\s*,\s*(.*?)\);?/g,
        "logger.info('$2', { data: $3 });"
      );
      // Handle console.log without message
      content = content.replace(
        /console\.log\((.*?)\);?/g,
        "logger.info('Info', { data: $1 });"
      );
      modified = true;
    }

    // Replace console.warn with logger.warn
    if (content.includes('console.warn')) {
      content = content.replace(
        /console\.warn\((['"`])(.*?)\1\s*,\s*(.*?)\);?/g,
        "logger.warn('$2', { data: $3 });"
      );
      content = content.replace(
        /console\.warn\((.*?)\);?/g,
        "logger.warn('Warning', { data: $1 });"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${relativePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const targetFile = process.argv[2];
  
  if (targetFile) {
    // Process single file
    const filePath = path.isAbsolute(targetFile) ? targetFile : path.join(process.cwd(), targetFile);
    if (fs.existsSync(filePath)) {
      replaceConsoleInFile(filePath);
    } else {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
  } else {
    // Process all API route files
    console.log('🔧 Replacing console statements with logger in API routes...\n');
    
    const routeFiles = findRouteFiles(API_ROUTES_DIR);
    let updatedCount = 0;
    
    for (const filePath of routeFiles) {
      if (replaceConsoleInFile(filePath)) {
        updatedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} files`);
    console.log(`   ⏭️  Skipped: ${routeFiles.length - updatedCount} files`);
    console.log(`\n🎉 Console replacement complete!`);
  }
}

main();
