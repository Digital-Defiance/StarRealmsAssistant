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

  // Explicitly configure HtmlWebpackPlugin for Capacitor build
  // Remove existing HtmlWebpackPlugin instance if NxAppWebpackPlugin added one
  config.plugins = config.plugins.filter(
    (plugin) => plugin.constructor.name !== 'HtmlWebpackPlugin'
  );
  // Add our own instance
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: './src/index.html', // Ensure this path is correct
      filename: 'index.html',
      // Ensure chunks are injected. 'all' includes vendor, main, runtime, etc.
      chunks: 'all',
      // Necessary for Capacitor: prevents base href injection if NxAppWebpackPlugin tries it
      baseHref: '/',
      // Ensure script loading is standard, not deferred or async unless intended
      scriptLoading: 'blocking',
    })
  );

  return config;
});
