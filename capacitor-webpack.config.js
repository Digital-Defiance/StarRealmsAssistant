// capacitor-webpack.config.js - Used for capacitor builds
const { composePlugins, withNx } = require('@nx/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.

  // Fix the output path format for compatibility with capacitor
  if (config.output) {
    // Force output.path to use forward slashes for capacitor compatibility
    const path = require('path');
    config.output.path = path.resolve(__dirname, 'dist/capacitor-app');

    // Make sure publicPath is set correctly
    config.output.publicPath = '';
  }

  // Check if HtmlWebpackPlugin is already configured
  const hasHtmlPlugin = config.plugins.some(
    (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin'
  );

  // Add HtmlWebpackPlugin if not already present
  if (!hasHtmlPlugin) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      })
    );
  }

  return config;
});
