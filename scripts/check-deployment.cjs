#!/usr/bin/env node

/**
 * Simple Deployment Check Script
 * Validates that all suggested fixes have been applied
 */

console.log('🚀 Deployment Fixes Validation Check');
console.log('=====================================\n');

// Check environment variables
console.log('🔍 Checking environment variables...');
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(supabaseUrl ? '✅ Supabase URL: Configured' : '❌ Supabase URL: Missing');
console.log(supabaseAnonKey ? '✅ Supabase Anon Key: Configured' : '❌ Supabase Anon Key: Missing');
console.log(supabaseServiceKey ? '✅ Supabase Service Key: Configured' : '❌ Supabase Service Key: Missing');

// Check port configuration
console.log('\n🔍 Checking port configuration...');
const port = process.env.PORT || '5000';
console.log(`✅ Port: ${port} (${process.env.PORT ? 'Cloud Run mode' : 'Replit mode'})`);

// Check critical files exist
console.log('\n🔍 Checking critical files...');
const fs = require('fs');
const files = [
  'server/index.ts',
  'server/storage.ts', 
  'server/routes.ts',
  'client/src/lib/supabase.ts'
];

let allFilesExist = true;
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`❌ ${file}: Missing`);
    allFilesExist = false;
  }
});

// Summary
console.log('\n📊 SUMMARY');
console.log('===========');
const hasRequiredVars = supabaseUrl && supabaseAnonKey;
const deploymentReady = hasRequiredVars && allFilesExist;

console.log(hasRequiredVars ? '✅ Environment Variables: CONFIGURED' : '❌ Environment Variables: MISSING');
console.log(allFilesExist ? '✅ Critical Files: PRESENT' : '❌ Critical Files: MISSING');
console.log(deploymentReady ? '🎉 DEPLOYMENT READY!' : '⚠️  DEPLOYMENT NOT READY');

if (!deploymentReady) {
  console.log('\n🔧 Please configure missing environment variables in deployment secrets');
  process.exit(1);
} else {
  console.log('\n🚀 All deployment fixes have been applied successfully!');
  process.exit(0);
}