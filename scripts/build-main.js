import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple copy script for main process files
const srcDir = path.join(__dirname, '../src/main');
const distDir = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy main.js
const mainSrc = path.join(srcDir, 'main.js');
const mainDist = path.join(distDir, 'main.js');
if (fs.existsSync(mainSrc)) {
  fs.copyFileSync(mainSrc, mainDist);
  console.log('✅ Copied main.js');
}

// Copy preload.js
const preloadSrc = path.join(srcDir, 'preload.js');
const preloadDist = path.join(distDir, 'preload.js');
if (fs.existsSync(preloadSrc)) {
  fs.copyFileSync(preloadSrc, preloadDist);
  console.log('✅ Copied preload.js');
}

console.log('🎉 Main process build complete!');
