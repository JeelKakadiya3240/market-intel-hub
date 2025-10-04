#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Production deployment build...');

try {
  // Build frontend first
  console.log('Building frontend (may take a moment)...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  // Copy server files for production
  console.log('Preparing server files...');
  execSync('cp -r server dist/', { stdio: 'inherit' });
  execSync('cp -r shared dist/', { stdio: 'inherit' });
  
  // Create a simple production runner that uses tsx
  const productionRunner = `#!/usr/bin/env node

// Production server entry point
// Uses tsx to handle TypeScript compilation at runtime
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('Starting production server...');

// Run the server using tsx in production mode
const server = spawn('npx', ['tsx', join(__dirname, 'server/index.ts')], {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log('Server process exited with code:', code);
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});
`;

  fs.writeFileSync('dist/index.js', productionRunner);
  
  // Copy package.json for dependencies
  console.log('Copying package.json...');
  execSync('cp package.json dist/', { stdio: 'inherit' });
  
  console.log('✅ Production deployment build completed!');
  console.log('📝 Ready for deployment with:');
  console.log('   - Frontend built and optimized');
  console.log('   - Server configured for production');
  console.log('   - Environment variables handled');
  console.log('🔧 Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in production');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}