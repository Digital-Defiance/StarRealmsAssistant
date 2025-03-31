// scripts/nx-compatible-capacitor.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const appName = 'starrealms-assistant';
const nxBuildDir = path.join(__dirname, '../dist', appName); // Where Nx builds to
const capacitorWebDir = path.join(__dirname, '../dist', 'capacitor-app');
const androidDir = path.join(__dirname, '../android');
const iosDir = path.join(__dirname, '../ios');
const capacitorPluginsDir = path.join(androidDir, 'capacitor-cordova-android-plugins');

console.log('Starting Nx compatible Capacitor setup...');

// Step 1: Attempt to build with Nx
console.log('Attempting Nx build...');
try {
  // Try the Nx build command
  execSync('nx build ' + appName, { stdio: 'inherit' });
  console.log('Nx build completed successfully');
} catch (error) {
  console.error('Nx build failed:', error);

  console.log('Attempting alternative build command...');
  try {
    // Try using the package.json build script
    execSync('yarn build', { stdio: 'inherit' });
    console.log('Yarn build completed successfully');
  } catch (buildError) {
    console.error('All build attempts failed. Proceeding with existing build if available.');
  }
}

// Step 2: Check if the Nx build produced output
if (fs.existsSync(nxBuildDir) && fs.readdirSync(nxBuildDir).length > 0) {
  console.log(`Nx build output found at ${nxBuildDir}`);

  // Ensure capacitor web directory exists
  if (!fs.existsSync(capacitorWebDir)) {
    fs.mkdirSync(capacitorWebDir, { recursive: true });
  }

  // Copy the Nx build output to capacitor web directory
  console.log('Copying Nx build output to Capacitor web directory...');
  copyDirRecursive(nxBuildDir, capacitorWebDir);

  // Modify index.html to add debugging
  const indexPath = path.join(capacitorWebDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('Adding debug tools to index.html...');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Add CSP meta tag if needed
    if (!indexHtml.includes('Content-Security-Policy')) {
      const headEnd = indexHtml.indexOf('</head>');
      if (headEnd !== -1) {
        indexHtml =
          indexHtml.slice(0, headEnd) +
          "\n  <meta http-equiv=\"Content-Security-Policy\" content=\"default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: content:\">\n" +
          indexHtml.slice(headEnd);
      }
    }

    // Add debug script
    const bodyEnd = indexHtml.indexOf('</body>');
    if (bodyEnd !== -1) {
      indexHtml =
        indexHtml.slice(0, bodyEnd) +
        `\n  <script>
  // Debug helper
  function logToScreen(message) {
    const debugDiv = document.getElementById('debug-output') || 
      (function() {
        const div = document.createElement('div');
        div.id = 'debug-output';
        div.style.position = 'fixed';
        div.style.bottom = '0';
        div.style.left = '0';
        div.style.right = '0';
        div.style.backgroundColor = 'rgba(0,0,0,0.7)';
        div.style.color = 'white';
        div.style.padding = '8px';
        div.style.fontFamily = 'monospace';
        div.style.fontSize = '12px';
        div.style.maxHeight = '30%';
        div.style.overflow = 'auto';
        div.style.zIndex = '10000';
        document.body.appendChild(div);
        return div;
      })();
    
    const logItem = document.createElement('div');
    logItem.textContent = new Date().toISOString() + ': ' + message;
    debugDiv.appendChild(logItem);
    debugDiv.scrollTop = debugDiv.scrollHeight;
    console.log(message);
  }

  logToScreen('App initializing...');
  
  document.addEventListener('DOMContentLoaded', function() {
    logToScreen('DOM content loaded');
  });
  
  document.addEventListener('deviceready', function() {
    logToScreen('Device ready event fired');
    if (window.Capacitor) {
      logToScreen('Running in Capacitor environment');
    }
  });
  
  window.onerror = function(message, source, lineno, colno, error) {
    logToScreen('ERROR: ' + message + ' at ' + source + ':' + lineno);
    return false;
  };
  </script>\n` +
        indexHtml.slice(bodyEnd);
    }

    fs.writeFileSync(indexPath, indexHtml);
  } else {
    console.error('Error: No index.html found in the build output!');
  }
} else {
  console.warn('No Nx build output found. Creating minimal web app for Capacitor.');

  // Create a minimal web app for Capacitor
  if (!fs.existsSync(capacitorWebDir)) {
    fs.mkdirSync(capacitorWebDir, { recursive: true });
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: content:">
  <title>Star Realms Assistant</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 16px; 
      background-color: #f5f5f5;
    }
    h1 { color: #6200ee; }
    button {
      background-color: #6200ee;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 16px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <h1>Star Realms Assistant</h1>
  <p>This is a minimal version of the app for testing. Nx build was not successful.</p>
  <button id="testBtn">Test Button</button>
  
  <script>
    // Debug helper
    function logToScreen(message) {
      const debugDiv = document.getElementById('debug-output') || 
        (function() {
          const div = document.createElement('div');
          div.id = 'debug-output';
          div.style.position = 'fixed';
          div.style.bottom = '0';
          div.style.left = '0';
          div.style.right = '0';
          div.style.backgroundColor = 'rgba(0,0,0,0.7)';
          div.style.color: 'white';
          div.style.padding = '8px';
          div.style.fontFamily = 'monospace';
          div.style.fontSize = '12px';
          div.style.maxHeight = '30%';
          div.style.overflow = 'auto';
          div.style.zIndex = '10000';
          document.body.appendChild(div);
          return div;
        })();
      
      const logItem = document.createElement('div');
      logItem.textContent = new Date().toISOString() + ': ' + message;
      debugDiv.appendChild(logItem);
      debugDiv.scrollTop = debugDiv.scrollHeight;
      console.log(message);
    }

    logToScreen('App initializing...');
    
    document.addEventListener('DOMContentLoaded', function() {
      logToScreen('DOM content loaded');
      
      document.getElementById('testBtn').addEventListener('click', function() {
        logToScreen('Button clicked!');
        alert('Button works!');
      });
    });
    
    document.addEventListener('deviceready', function() {
      logToScreen('Device ready event fired');
    });
    
    window.onerror = function(message, source, lineno, colno, error) {
      logToScreen('ERROR: ' + message + ' at ' + source + ':' + lineno);
      return false;
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(capacitorWebDir, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(capacitorWebDir, 'bundle.js'), 'console.log("Fallback app loaded");');
}

// Step 3: Update Capacitor config
console.log('Updating Capacitor configuration...');
const capacitorConfigPath = path.join(__dirname, '../capacitor.config.ts');
const configContent = `
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starrealmsassistant.app',
  appName: 'StarRealmsAssistant',
  webDir: 'dist/capacitor-app',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
`;

fs.writeFileSync(capacitorConfigPath, configContent);

// Step 4: Add Android platform if it doesn't exist
if (!fs.existsSync(androidDir)) {
  console.log('Adding Android platform...');
  try {
    execSync('npx cap add android', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to add Android platform:', error);
  }
}

// Step 5: Create necessary Gradle files
if (fs.existsSync(capacitorPluginsDir)) {
  console.log('Creating plugin configuration files...');

  // Create cordova.variables.gradle
  const cordovaVarsPath = path.join(capacitorPluginsDir, 'cordova.variables.gradle');
  if (!fs.existsSync(cordovaVarsPath)) {
    fs.writeFileSync(cordovaVarsPath, '// This file is intentionally empty');
  }

  // Create build-extras.gradle
  const buildExtrasPath = path.join(
    capacitorPluginsDir,
    'capacitor-cordova-android-plugins-build-extras.gradle'
  );
  if (!fs.existsSync(buildExtrasPath)) {
    fs.writeFileSync(
      buildExtrasPath,
      '// This file is automatically generated.\n// Do not modify - YOUR CHANGES WILL BE ERASED!'
    );
  }

  // Create build.gradle if it doesn't exist
  const buildGradlePath = path.join(capacitorPluginsDir, 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    const buildGradleContent = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.3.1'
    }
}

apply plugin: 'com.android.library'

android {
    namespace "capacitor.cordova.android.plugins"
    compileSdkVersion project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 33
    defaultConfig {
        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 23
        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 33
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:1.6.1"
}

// Hooks
if (file('capacitor-cordova-android-plugins-build-extras.gradle').exists()) {
    apply from: 'capacitor-cordova-android-plugins-build-extras.gradle'
}`;

    fs.writeFileSync(buildGradlePath, buildGradleContent);
  }
}

// Step 6: Create variables.gradle in android directory
if (fs.existsSync(androidDir)) {
  const variablesGradlePath = path.join(androidDir, 'variables.gradle');
  if (!fs.existsSync(variablesGradlePath)) {
    console.log('Creating variables.gradle...');
    const variablesContent = `ext {
    minSdkVersion = 23
    compileSdkVersion = 33
    targetSdkVersion = 33
    androidxActivityVersion = '1.4.0'
    androidxAppCompatVersion = '1.4.2'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.8.0'
    androidxFragmentVersion = '1.4.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}`;

    fs.writeFileSync(variablesGradlePath, variablesContent);
  }
}

// Step 7: Run Capacitor sync
console.log('Running Capacitor sync...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log('Capacitor sync successful');
} catch (error) {
  console.error('Sync failed:', error);
}

console.log('\nSetup complete! You can now open the native project:');
console.log('  npx cap open android');

// Helper function to recursively copy directories
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
