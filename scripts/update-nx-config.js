// scripts/update-nx-config.js
const fs = require('fs');
const path = require('path');

// Find project configuration
const findProjectConfig = () => {
  // Check for project.json
  const projectJsonPath = path.join(__dirname, '..', 'project.json');
  if (fs.existsSync(projectJsonPath)) {
    return {
      type: 'project',
      path: projectJsonPath,
    };
  }

  // Check for workspace.json
  const workspaceJsonPath = path.join(__dirname, '..', 'workspace.json');
  if (fs.existsSync(workspaceJsonPath)) {
    return {
      type: 'workspace',
      path: workspaceJsonPath,
    };
  }

  return null;
};

const projectConfig = findProjectConfig();
if (projectConfig) {
  console.log(`Found project configuration at ${projectConfig.path}`);

  const config = JSON.parse(fs.readFileSync(projectConfig.path, 'utf8'));

  // Update the build configuration
  if (config.projects && config.projects['starrealms-assistant']) {
    const projectConfig = config.projects['starrealms-assistant'];

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
          outputPath: 'dist/capacitor-app',
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
        outputPath: 'dist/capacitor-app',
      };
    }

    fs.writeFileSync(projectConfig.path, JSON.stringify(config, null, 2));
    console.log('Updated project configuration for Capacitor');
  }
}
