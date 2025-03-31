// scripts/capacitor-clean.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const androidDir = path.join(__dirname, '../android');
const iosDir = path.join(__dirname, '../ios');
const buildOutputDir = path.join(__dirname, '../dist/capacitor-app');
const capacitorPluginsDir = path.join(androidDir, 'capacitor-cordova-android-plugins');

// Remove platforms and recreate
console.log('Cleaning Capacitor installation...');

// Remove android directory if it exists
if (fs.existsSync(androidDir)) {
  console.log('Removing Android platform...');
  fs.rmSync(androidDir, { recursive: true, force: true });
}

// Remove ios directory if it exists
if (fs.existsSync(iosDir)) {
  console.log('Removing iOS platform...');
  fs.rmSync(iosDir, { recursive: true, force: true });
}

// Create build output directory if it doesn't exist
console.log('Setting up web app directory...');
if (!fs.existsSync(buildOutputDir)) {
  fs.mkdirSync(buildOutputDir, { recursive: true });
}

// Create a minimal index.html if it doesn't exist
if (!fs.existsSync(path.join(buildOutputDir, 'index.html'))) {
  console.log('Creating minimal web app...');
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Star Realms Assistant</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    #root { width: 100%; }
  </style>
</head>
<body>
  <div id="root">
    <h1>Star Realms Assistant</h1>
    <p>Loading application...</p>
  </div>
  <script>
    // Minimal script to indicate app is loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Star Realms Assistant app loaded');
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(buildOutputDir, 'index.html'), indexHtml);

  // Create empty JS file if needed
  if (!fs.existsSync(path.join(buildOutputDir, 'bundle.js'))) {
    fs.writeFileSync(path.join(buildOutputDir, 'bundle.js'), 'console.log("App loaded");');
  }
}

// Update capacitor.config.ts with the correct path
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
console.log('Updated capacitor.config.ts with webDir: dist/capacitor-app');

// Add platforms
console.log('Adding Android platform...');
try {
  execSync('npx cap add android', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to add Android platform:', error);
}

console.log('Adding iOS platform...');
try {
  execSync('npx cap add ios', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to add iOS platform:', error);
}

// Create necessary files for plugins
if (fs.existsSync(capacitorPluginsDir)) {
  console.log('Creating plugin configuration files...');

  // Create build.gradle if it doesn't exist
  const buildGradlePath = path.join(capacitorPluginsDir, 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    const buildGradleContent = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
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
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
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
}

// Also create variables.gradle in android directory to define SDK versions
const variablesGradlePath = path.join(androidDir, 'variables.gradle');
if (fs.existsSync(androidDir) && !fs.existsSync(variablesGradlePath)) {
  console.log('Creating variables.gradle...');
  const variablesContent = `ext {
    minSdkVersion = 23
    compileSdkVersion = 33
    targetSdkVersion = 33
    androidxActivityVersion = '1.7.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.10.0'
    androidxFragmentVersion = '1.5.6'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}`;

  fs.writeFileSync(variablesGradlePath, variablesContent);
}

console.log('Running Capacitor sync...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
} catch (error) {
  console.error('Sync failed:', error);
}

console.log('\nCapacitor clean and setup complete!');
console.log('You can now open the native projects:');
console.log('  npx cap open android');
console.log('  npx cap open ios');
