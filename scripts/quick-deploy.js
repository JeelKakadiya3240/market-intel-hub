#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Quick deployment build for production...');

// Simple direct TypeScript compilation using tsx without bundling
console.log('Building server with tsx...');
try {
  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  // Copy server files and compile directly without bundling
  console.log('Compiling TypeScript server files...');
  execSync('npx tsx --tsconfig tsconfig.production.json server/index.ts --dry-run', { stdio: 'inherit' });
  
  // For now, just copy the entire server directory and use tsx in production
  execSync('cp -r server dist/', { stdio: 'inherit' });
  
  // Create a simple production runner
  const productionRunner = `#!/usr/bin/env node
import { spawn } from 'child_process';

// Run the server using tsx in production
const server = spawn('npx', ['tsx', 'dist/server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log('Server exited with code:', code);
  process.exit(code);
});
`;

  fs.writeFileSync('dist/index.js', productionRunner);
  
  console.log('✅ Quick deployment build completed!');
  console.log('📝 Note: This uses tsx in production for faster deployment');
  console.log('🔧 Environment variables should be configured in production secrets');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}