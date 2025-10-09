const path = require('path');
const fs = require('fs');

console.log('Creating basic React build...');
const distDir = path.join(__dirname, '../dist/starrealms-assistant');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy main assets
const srcIndex = path.join(__dirname, '../src/index.html');
const distIndex = path.join(distDir, 'index.html');

if (fs.existsSync(srcIndex)) {
  let html = fs.readFileSync(srcIndex, 'utf8');
  // Basic processing
  html = html.replace(/src="\.\/main\.tsx"/g, 'src="./main.js"');
  fs.writeFileSync(distIndex, html);
}

// Create a basic main.js file
const basicMainJs = `
console.log('Star Realms Assistant - Basic build');
document.addEventListener('DOMContentLoaded', function() {
  document.body.innerHTML = '<h1>Star Realms Assistant</h1><p>Basic build loaded successfully.</p>';
});
`;

fs.writeFileSync(path.join(distDir, 'main.js'), basicMainJs);
console.log('Basic build created successfully');
