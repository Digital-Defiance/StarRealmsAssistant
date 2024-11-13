#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Parse command line arguments
NO_END=false
for arg in "$@"; do
  case $arg in
    --noEnd)
      NO_END=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Build the createLargeGame.ts file using Nx
echo "Building createLargeGame.ts..."
yarn nx run dominion-assistant:build-create-large-game

# Run the compiled JavaScript file with Node.js using Nx
echo "Running the compiled JavaScript file..."
if [ "$NO_END" = true ]; then
  yarn nx run dominion-assistant:run-create-large-game --noEnd
else
  yarn nx run dominion-assistant:run-create-large-game
fi

echo "Done."