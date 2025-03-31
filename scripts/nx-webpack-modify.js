// scripts/nx-webpack-modify.js
const fs = require('fs');
const path = require('path');

/**
 * This script attempts to find and modify the Nx webpack configuration
 * to make it compatible with Capacitor by fixing the output path issue.
 */

// Find nx.json to locate the workspace root
const findNxConfig = () => {
  let currentDir = __dirname;
  while (currentDir !== path.parse(currentDir).root) {
    const nxJsonPath = path.join(currentDir, 'nx.json');
    if (fs.existsSync(nxJsonPath)) {
      return {
        workspaceRoot: currentDir,
        nxJsonPath,
      };
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
};

// Try to find webpack.config.js or workspace.json or angular.json in the Nx workspace
const findWebpackConfig = (workspaceRoot) => {
  // Check for webpack.config.js in project root
  const webpackConfigPath = path.join(workspaceRoot, 'webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    return {
      type: 'webpack',
      path: webpackConfigPath,
    };
  }

  // Check for workspace.json
  const workspaceJsonPath = path.join(workspaceRoot, 'workspace.json');
  if (fs.existsSync(workspaceJsonPath)) {
    return {
      type: 'workspace',
      path: workspaceJsonPath,
    };
  }

  // Check for angular.json (used in some Nx workspaces)
  const angularJsonPath = path.join(workspaceRoot, 'angular.json');
  if (fs.existsSync(angularJsonPath)) {
    return {
      type: 'angular',
      path: angularJsonPath,
    };
  }

  return null;
};

// Create a capacitor-compatible webpack.config.js
const createCapacitorWebpackConfig = (workspaceRoot) => {
  const configPath = path.join(workspaceRoot, 'capacitor-webpack.config.js');
  const content = `// capacitor-webpack.config.js - Used for capacitor builds
const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. config.plugins.push(new MyPlugin())
  
  // Fix the output path format for compatibility with capacitor
  if (config.output) {
    // Force output.path to use forward slashes for capacitor compatibility
    const path = require('path');
    config.output.path = path.resolve(__dirname, 'dist/capacitor-app');
    
    // Make sure publicPath is set correctly
    config.output.publicPath = '';
  }
  
  return config;
});
`;

  fs.writeFileSync(configPath, content);
  console.log(`Created capacitor-compatible webpack config at ${configPath}`);
  return configPath;
};

// Create a script to modify Nx project configuration
const createNxProjectScript = (workspaceRoot, appName) => {
  const scriptPath = path.join(workspaceRoot, 'scripts', 'update-nx-config.js');
  const content = `// scripts/update-nx-config.js
const fs = require('fs');
const path = require('path');

// Find project configuration
const findProjectConfig = () => {
  // Check for project.json
  const projectJsonPath = path.join(__dirname, '..', 'project.json');
  if (fs.existsSync(projectJsonPath)) {
    return {
      type: 'project',
      path: projectJsonPath
    };
  }
  
  // Check for workspace.json
  const workspaceJsonPath = path.join(__dirname, '..', 'workspace.json');
  if (fs.existsSync(workspaceJsonPath)) {
    return {
      type: 'workspace',
      path: workspaceJsonPath
    };
  }
  
  return null;
};

const projectConfig = findProjectConfig();
if (projectConfig) {
  console.log(\`Found project configuration at \${projectConfig.path}\`);
  
  const config = JSON.parse(fs.readFileSync(projectConfig.path, 'utf8'));
  
  // Update the build configuration
  if (config.projects && config.projects['${appName}']) {
    const projectConfig = config.projects['${appName}'];
    
    if (projectConfig.architect && projectConfig.architect.build) {
      const buildConfig = projectConfig.architect.build;
      
      // Update output path
      if (buildConfig.options) {
        buildConfig.options.outputPath = 'dist/capacitor-app';
      }
      
      // Add capacitor-specific configuration
      if (!buildConfig.configurations.capacitor) {
        buildConfig.configurations.capacitor = {
          ...buildConfig.configurations.production,
          outputPath: 'dist/capacitor-app'
        };
      }
      
      fs.writeFileSync(projectConfig.path, JSON.stringify(config, null, 2));
      console.log('Updated project configuration for Capacitor');
    }
  } else if (config.targets && config.targets.build) {
    // Project.json format
    const buildConfig = config.targets.build;
    
    // Update output path
    if (buildConfig.options) {
      buildConfig.options.outputPath = 'dist/capacitor-app';
    }
    
    // Add capacitor-specific configuration
    if (!buildConfig.configurations.capacitor) {
      buildConfig.configurations.capacitor = {
        ...buildConfig.configurations.production,
        outputPath: 'dist/capacitor-app'
      };
    }
    
    fs.writeFileSync(projectConfig.path, JSON.stringify(config, null, 2));
    console.log('Updated project configuration for Capacitor');
  }
}
`;

  // Create scripts directory if it doesn't exist
  const scriptsDir = path.join(workspaceRoot, 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  fs.writeFileSync(scriptPath, content);
  console.log(`Created Nx project updater script at ${scriptPath}`);
  return scriptPath;
};

// Add a build script to package.json
const updatePackageJson = (workspaceRoot) => {
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add capacitor scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['cap:nx-build'] = 'node scripts/nx-compatible-capacitor.js';
    packageJson.scripts['cap:build'] = 'nx build --configuration=capacitor && npx cap sync';
    packageJson.scripts['cap:init'] =
      'npx cap init StarRealmsAssistant com.starrealmsassistant.app';
    packageJson.scripts['cap:add:android'] = 'npx cap add android';
    packageJson.scripts['cap:add:ios'] = 'npx cap add ios';
    packageJson.scripts['cap:open:android'] = 'npx cap open android';
    packageJson.scripts['cap:open:ios'] = 'npx cap open ios';

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated ${packageJsonPath} with Capacitor scripts`);
  }
};

// Main function
const main = () => {
  const nxConfig = findNxConfig();
  if (!nxConfig) {
    console.error('Could not find Nx workspace configuration.');
    return;
  }

  console.log(`Found Nx workspace at ${nxConfig.workspaceRoot}`);

  const webpackConfig = findWebpackConfig(nxConfig.workspaceRoot);
  if (webpackConfig) {
    console.log(`Found configuration at ${webpackConfig.path}`);
  } else {
    console.log('Could not find existing webpack config, creating one...');
  }

  // Create capacitor-webpack.config.js
  const capacitorWebpackConfig = createCapacitorWebpackConfig(nxConfig.workspaceRoot);

  // Create Nx project configuration updater
  const appName = 'starrealms-assistant'; // Use your actual app name
  createNxProjectScript(nxConfig.workspaceRoot, appName);

  // Update package.json
  updatePackageJson(nxConfig.workspaceRoot);

  console.log('\nNx workspace ready for Capacitor integration!');
  console.log('Next steps:');
  console.log(
    '1. Run: node scripts/update-nx-config.js (if you have project.json or workspace.json)'
  );
  console.log('2. Run: yarn cap:nx-build');
  console.log('3. Run: npx cap open android');
};

main();
