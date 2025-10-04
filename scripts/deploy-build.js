#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Starting deployment build process...');

// Build frontend
console.log('Building frontend...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Build backend with improved configuration
console.log('Building backend...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    packages: 'external', // Keep all packages external to avoid bundling issues
    minify: false, // Disable minification to avoid potential issues
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    external: [
      // Explicitly mark problematic packages as external
      'bufferutil',
      'utf-8-validate',
      'lightningcss',
      '@babel/preset-typescript',
      'esbuild',
      'dotenv'
    ],
    // Add loader for TypeScript with relaxed error handling
    loader: {
      '.ts': 'ts'
    },
    // Ignore TypeScript errors for deployment
    tsconfig: 'tsconfig.production.json'
  });
  
  console.log('Backend build completed successfully!');
  
  // Verify the build
  if (fs.existsSync('dist/index.js')) {
    console.log('✅ Production build ready for deployment');
    console.log('✅ Frontend assets built');
    console.log('✅ Backend server bundle created');
    console.log('\nDeployment checklist:');
    console.log('- Ensure environment variables are configured in production');
    console.log('- Run "npm run start" to test the production build');
  } else {
    throw new Error('Build output not found');
  }
  
} catch (error) {
  console.error('Backend build failed:', error);
  process.exit(1);
}