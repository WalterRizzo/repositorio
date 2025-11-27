#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const clientDir = path.resolve(process.cwd(), 'dist', 'client');

if (!fs.existsSync(clientDir)) {
  console.error('No built client found. Run `npm run build` first.');
  process.exit(1);
}

console.log('Static build exists at:', clientDir);
console.log('You can now upload the contents of this folder to any static host (S3, CDN, Netlify, Vercel, etc).');
console.log('For a full rebuild + prepare run:');
console.log('  npm run build');
console.log('  node scripts/prepare-static-deploy.js');

// keep the script intentionally simple — packaging and remote deploy can be added per target/credentials
process.exit(0);
