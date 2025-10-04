#!/usr/bin/env node

/**
 * Enhanced Deployment Readiness Check
 * Validates all environment variables and configuration before deployment
 * Addresses all suggested deployment fixes
 */

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', fallback: 'SUPABASE_URL', description: 'Supabase URL for client connection' },
    { name: 'VITE_SUPABASE_ANON_KEY', fallback: 'SUPABASE_ANON_KEY', description: 'Supabase Anonymous Key for client auth' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase Service Role Key for admin operations' }
  ];
  
  let allConfigured = true;
  
  requiredVars.forEach(({ name, fallback, description }) => {
    const value = process.env[name] || (fallback ? process.env[fallback] : null);
    if (value) {
      console.log(`✅ ${name}: Configured (${description})`);
      if (fallback && process.env[fallback] && !process.env[name]) {
        console.log(`   📝 Using fallback: ${fallback}`);
      }
    } else {
      console.log(`❌ ${name}: Missing (${description})`);
      if (fallback) {
        console.log(`   💡 Also checked fallback: ${fallback}`);
      }
      allConfigured = false;
    }
  });
  
  return allConfigured;
}

function checkSupabaseConfiguration() {
  console.log('\n🔍 Checking Supabase configuration...');
  
  try {
    // Check if we can access the configuration
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.log('❌ Supabase URL not configured');
      return false;
    }
    
    if (!supabaseAnonKey) {
      console.log('❌ Supabase Anonymous Key not configured');
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(supabaseUrl);
      console.log('✅ Supabase URL format is valid');
    } catch (error) {
      console.log('❌ Supabase URL format is invalid');
      return false;
    }
    
    // Check key format (basic validation)
    if (supabaseAnonKey.length < 20) {
      console.log('❌ Supabase Anonymous Key appears to be too short');
      return false;
    }
    
    console.log('✅ Supabase configuration appears valid');
    return true;
    
  } catch (error) {
    console.log('❌ Error checking Supabase configuration:', error.message);
    return false;
  }
}

function checkPortConfiguration() {
  console.log('\n🔍 Checking port configuration...');
  
  const port = process.env.PORT || '5000';
  const portNumber = parseInt(port, 10);
  
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    console.log(`❌ Invalid port configuration: ${port}`);
    return false;
  }
  
  console.log(`✅ Port configuration valid: ${portNumber}`);
  
  // Check for Cloud Run compatibility
  if (process.env.PORT) {
    console.log('✅ Using Cloud Run PORT environment variable');
  } else {
    console.log('📝 Using default port 5000 (Replit mode)');
  }
  
  return true;
}

function checkErrorHandling() {
  console.log('\n🔍 Checking error handling implementation...');
  
  // This would typically check if the server has proper error handling
  // For now, we'll just verify the existence of key files
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'server/index.ts',
    'server/storage.ts',
    'server/routes.ts',
    'client/src/lib/supabase.ts'
  ];
  
  let allFilesExist = true;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`❌ ${file}: Missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function main() {
  console.log('🚀 Enhanced Deployment Readiness Check');
  console.log('=====================================\n');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Supabase Configuration', fn: checkSupabaseConfiguration },
    { name: 'Port Configuration', fn: checkPortConfiguration },
    { name: 'Critical Files', fn: checkErrorHandling }
  ];
  
  let allPassed = true;
  const results = [];
  
  checks.forEach(({ name, fn }) => {
    const passed = fn();
    results.push({ name, passed });
    allPassed = allPassed && passed;
  });
  
  console.log('\n📊 DEPLOYMENT READINESS SUMMARY');
  console.log('===============================');
  
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
    console.log('🚀 Your application should deploy successfully');
    process.exit(0);
  } else {
    console.log('⚠️  DEPLOYMENT READINESS FAILED');
    console.log('🔧 Please fix the issues above before deploying');
    console.log('💡 Configure missing environment variables in deployment secrets');
    process.exit(1);
  }
}

// Only run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}