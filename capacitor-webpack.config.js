// capacitor-webpack.config.js - Used for capacitor builds
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
