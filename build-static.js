const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Build the client app
console.log('Building the frontend...');
execSync('cd client && vite build --outDir ../dist', { stdio: 'inherit' });

// Copy index.html to dist folder
console.log('Copying index.html...');
fs.copyFileSync('./index.html', './dist/index.html');

// Create a 404.html file for GitHub Pages SPA support
console.log('Creating 404.html for SPA routing...');
fs.copyFileSync('./dist/index.html', './dist/404.html');

console.log('Static build completed! Files are in the ./dist directory.');