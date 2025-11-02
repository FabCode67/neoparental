#!/usr/bin/env node

/**
 * Setup Validator Script
 * Run this to check if everything is configured correctly
 * 
 * Usage: node scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 NeoParental App - Setup Validator\n');
console.log('═'.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env file exists
console.log('\n1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Read and validate .env contents
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required variables
  const requiredVars = [
    'EXPO_PUBLIC_LAPTOP_IP',
    'EXPO_PUBLIC_BACKEND_URL',
    'EXPO_PUBLIC_PREDICTION_API_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (match && match[1].trim()) {
        const value = match[1].trim();
        
        // Special validation for LAPTOP_IP
        if (varName === 'EXPO_PUBLIC_LAPTOP_IP') {
          if (value === '192.168.1.100') {
            console.log(`   ⚠️  ${varName} is using default value`);
            console.log('      → Update it with your actual IP address!');
            hasWarnings = true;
          } else if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
            console.log(`   ⚠️  ${varName} format looks incorrect: ${value}`);
            console.log('      → Should be like: 192.168.1.100');
            hasWarnings = true;
          } else {
            console.log(`   ✅ ${varName} is set: ${value}`);
          }
        } else {
          console.log(`   ✅ ${varName} is set`);
        }
      } else {
        console.log(`   ❌ ${varName} is empty`);
        hasErrors = true;
      }
    } else {
      console.log(`   ❌ ${varName} is missing`);
      hasErrors = true;
    }
  });
  
} else {
  console.log('   ❌ .env file not found!');
  console.log('      → Run: cp .env.example .env');
  hasErrors = true;
}

// Check 2: node_modules installed
console.log('\n2️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
  
  // Check for critical packages
  const criticalPackages = [
    'expo',
    'expo-constants',
    'expo-audio',
    'react',
    'react-native',
    '@react-native-async-storage/async-storage'
  ];
  
  criticalPackages.forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`   ✅ ${pkg} installed`);
    } else {
      console.log(`   ❌ ${pkg} not found`);
      console.log('      → Run: npm install');
      hasErrors = true;
    }
  });
  
} else {
  console.log('   ❌ node_modules not found');
  console.log('      → Run: npm install');
  hasErrors = true;
}

// Check 3: Backend directory
console.log('\n3️⃣  Checking backend...');
const backendPath = path.join(__dirname, '..', 'backend');
if (fs.existsSync(backendPath)) {
  console.log('   ✅ Backend directory exists');
  
  // Check for main.py
  const mainPyPath = path.join(backendPath, 'main.py');
  if (fs.existsSync(mainPyPath)) {
    console.log('   ✅ main.py found');
  } else {
    console.log('   ⚠️  main.py not found in backend/');
    hasWarnings = true;
  }
  
  // Check for backend .env
  const backendEnvPath = path.join(backendPath, '.env');
  if (fs.existsSync(backendEnvPath)) {
    console.log('   ✅ Backend .env exists');
  } else {
    console.log('   ⚠️  Backend .env not found');
    hasWarnings = true;
  }
  
} else {
  console.log('   ⚠️  Backend directory not found');
  hasWarnings = true;
}

// Check 4: Git configuration
console.log('\n4️⃣  Checking Git setup...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('   ✅ .env is in .gitignore');
  } else {
    console.log('   ⚠️  .env should be in .gitignore');
    console.log('      → Add ".env" to .gitignore file');
    hasWarnings = true;
  }
} else {
  console.log('   ⚠️  .gitignore not found');
  hasWarnings = true;
}

// Check 5: Required files
console.log('\n5️⃣  Checking configuration files...');
const requiredFiles = [
  { path: 'app.json', critical: true },
  { path: 'package.json', critical: true },
  { path: 'utils/api-config.ts', critical: true },
  { path: 'utils/api.ts', critical: true },
  { path: '.env.example', critical: false },
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file.path} exists`);
  } else {
    if (file.critical) {
      console.log(`   ❌ ${file.path} not found`);
      hasErrors = true;
    } else {
      console.log(`   ⚠️  ${file.path} not found`);
      hasWarnings = true;
    }
  }
});

// Final summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 Summary:\n');

if (!hasErrors && !hasWarnings) {
  console.log('   🎉 Perfect! Everything is configured correctly!');
  console.log('\n   Next steps:');
  console.log('   1. Start backend: cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000');
  console.log('   2. Start Expo: npm start');
  console.log('   3. Scan QR code with Expo Go app\n');
} else if (hasErrors) {
  console.log('   ❌ Found critical errors! Please fix them before running the app.');
  console.log('\n   Common fixes:');
  console.log('   - Missing .env? Run: cp .env.example .env');
  console.log('   - Missing packages? Run: npm install');
  console.log('   - Update your IP in .env file\n');
} else if (hasWarnings) {
  console.log('   ⚠️  Found some warnings, but you can proceed.');
  console.log('   Consider fixing these for the best experience.\n');
}

console.log('═'.repeat(60) + '\n');

// Exit with appropriate code
process.exit(hasErrors ? 1 : 0);
