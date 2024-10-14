/* eslint-disable @typescript-eslint/no-var-requires */
const typescript = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const prettierConfig = require('eslint-config-prettier');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    indent: ['error', 2], // Ensure ESLint uses the same tab width as Prettier
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: {
        ...typescript.configs['recommended'].rules,
        ...reactPlugin.configs['recommended'].rules,
        ...reactHooksPlugin.configs['recommended'].rules,
        ...prettierConfig.rules, // Ensure Prettier rules are included
      },
    },
  ],
};
