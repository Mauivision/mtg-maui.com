#!/usr/bin/env node

/**
 * Production Deployment Script for MTG Maui League
 * This script helps prepare your application for HostGator deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MTG Maui League - Production Deployment Script\n');

function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    console.log(`✅ ${description} completed\n`);
    return result;
  } catch (error) {
    console.error(`❌ Error during ${description}:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');

  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
  } catch {
    console.log('❌ Vercel CLI not found. Installing...');
    runCommand('npm install -g vercel', 'Installing Vercel CLI');
  }

  // Check if user is logged in to Vercel (optional for HostGator)
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Vercel CLI available (optional for HostGator deployment)');
  } catch {
    console.log('ℹ️  Vercel not configured (not needed for HostGator deployment)');
  }

  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local not found. Please create it based on .env.example');
    console.log('   Copy .env.example to .env.local and fill in your values');
    process.exit(1);
  }

  console.log('✅ Prerequisites check passed\n');
}

function setupDatabase() {
  console.log('🗄️  Setting up database...\n');

  runCommand('npx prisma generate', 'Generating Prisma client');
  runCommand('npx prisma db push', 'Pushing database schema');

  console.log('✅ Database setup completed\n');
}

function prepareBuild() {
  console.log('🔨 Preparing production build...\n');

  runCommand('npm run build', 'Building Next.js application');

  console.log('✅ Build preparation completed\n');
}

function createDeploymentPackage() {
  console.log('📦 Creating deployment package...\n');

  const packagePath = 'mtg-maui-deployment.zip';

  // Create a list of files to exclude
  const excludePatterns = [
    'node_modules',
    '.git',
    '.next',
    'prisma/dev.db',
    '.env.local',
    '.env',
    '*.log',
    '.DS_Store',
    'coverage',
    '.vercel',
  ];

  // Use 7zip or zip to create archive excluding unwanted files
  try {
    // Try 7zip first (Windows)
    runCommand(
      `7z a -tzip ${packagePath} . -xr!${excludePatterns.join(' -xr!')}`,
      'Creating deployment archive with 7zip'
    );
  } catch {
    try {
      // Try zip command (Linux/Mac)
      const excludeArgs = excludePatterns.map(pattern => `--exclude="${pattern}"`).join(' ');
      runCommand(`zip -r ${packagePath} . ${excludeArgs}`, 'Creating deployment archive with zip');
    } catch {
      console.log('⚠️  No archive tool found. Please manually create a ZIP file excluding:');
      console.log('   - node_modules/');
      console.log('   - .git/');
      console.log('   - .next/');
      console.log('   - prisma/dev.db');
      console.log('   - .env* files');
      console.log('   - *.log files');
    }
  }

  console.log('✅ Deployment package created\n');
  console.log('📁 Upload mtg-maui-deployment.zip to your HostGator cPanel File Manager\n');
}

function generateDeploymentInstructions() {
  console.log('📋 HostGator Deployment Instructions:\n');

  console.log('1. 🗄️  DATABASE SETUP:');
  console.log('   - Go to cPanel → MySQL Databases');
  console.log('   - Create database: mtgmaui_db');
  console.log('   - Create user and add to database with ALL privileges');
  console.log('   - Update DATABASE_URL in your .env file\n');

  console.log('2. 📁 FILE UPLOAD:');
  console.log('   - Extract mtg-maui-deployment.zip to public_html/');
  console.log('   - OR use cPanel File Manager to upload files\n');

  console.log('3. 🔧 SERVER SETUP:');
  console.log('   - SSH into your server or use cPanel Terminal');
  console.log('   - Run: cd public_html && npm install --production');
  console.log('   - Run: npm run build (if not already built)\n');

  console.log('4. 🌍 ENVIRONMENT:');
  console.log('   - Create .env file in public_html/ with your variables');
  console.log('   - Make sure NEXTAUTH_URL is set to https://mtg-maui.com\n');

  console.log('5. 🚀 START APPLICATION:');
  console.log('   - Install PM2: npm install -g pm2');
  console.log('   - Start app: pm2 start npm --name "mtg-maui" -- start');
  console.log('   - Save config: pm2 save && pm2 startup\n');

  console.log('6. 🗃️  DATABASE MIGRATION:');
  console.log('   - Run: npx prisma generate && npx prisma db push\n');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  console.log('Available commands:');
  console.log('  check    - Check prerequisites');
  console.log('  build    - Build application for production');
  console.log('  package  - Create deployment package');
  console.log('  db       - Setup database locally');
  console.log('  instructions - Show HostGator deployment instructions');
  console.log('  full     - Run complete preparation (default)\n');

  switch (command) {
    case 'check':
      checkPrerequisites();
      break;

    case 'build':
      prepareBuild();
      break;

    case 'package':
      createDeploymentPackage();
      break;

    case 'db':
      setupDatabase();
      break;

    case 'instructions':
      generateDeploymentInstructions();
      break;

    case 'full':
    default:
      checkPrerequisites();
      setupDatabase();
      prepareBuild();
      createDeploymentPackage();
      generateDeploymentInstructions();
      break;
  }
}

if (require.main === module) {
  main();
}
