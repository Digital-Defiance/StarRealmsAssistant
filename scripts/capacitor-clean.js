// scripts/selective-capacitor-clean.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const androidDir = path.join(__dirname, '../android');
const iosDir = path.join(__dirname, '../ios');
const webBuildDir = path.join(__dirname, '../dist/capacitor-app');

console.log('Starting selective Capacitor cleanup...');

// Clean Android build directories but preserve resource files
if (fs.existsSync(androidDir)) {
  console.log('Cleaning Android build artifacts...');

  // Clean specific directories that contain build artifacts
  const androidCleanDirs = [
    path.join(androidDir, 'app/build'),
    path.join(androidDir, 'build'),
    path.join(androidDir, '.gradle'),
  ];

  androidCleanDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

// Clean iOS build directories but preserve resource files
if (fs.existsSync(iosDir)) {
  console.log('Cleaning iOS build artifacts...');

  // Clean specific directories that contain build artifacts
  const iosCleanDirs = [
    path.join(iosDir, 'build'),
    path.join(iosDir, 'App/build'),
    path.join(iosDir, 'DerivedData'),
  ];

  iosCleanDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // Remove Pods but keep Podfile
  const podsDir = path.join(iosDir, 'App/Pods');
  if (fs.existsSync(podsDir)) {
    console.log('Removing Pods directory...');
    fs.rmSync(podsDir, { recursive: true, force: true });
  }
}

// Clean and rebuild the web build directory
if (fs.existsSync(webBuildDir)) {
  console.log('Cleaning web build directory...');
  fs.rmSync(webBuildDir, { recursive: true, force: true });
}
fs.mkdirSync(webBuildDir, { recursive: true });

// Run the build script
console.log('Running Capacitor build...');
try {
  execSync('node scripts/nx-compatible-capacitor.js', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
}

// Sync with Capacitor
console.log('Running Capacitor sync...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log('Capacitor sync completed successfully');
} catch (error) {
  console.error('Sync failed:', error);
}

console.log('\nSelective cleanup and rebuild complete!');
console.log('Your custom resources (including icons) should be preserved.');
console.log('You can now open the native projects:');
console.log('  npx cap open android');
console.log('  npx cap open ios');
