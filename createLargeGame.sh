#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the createLargeGame.ts file using Nx
echo "Building createLargeGame.ts..."
yarn nx run dominion-assistant:build-create-large-game

# Run the compiled JavaScript file with Node.js using Nx
echo "Running the compiled JavaScript file..."
yarn nx run dominion-assistant:run-create-large-game

echo "Done."