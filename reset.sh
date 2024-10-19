#!/bin/bash
# Description: Cleans up node_modules, dist, and coverage directories, then reinstalls dependencies.
# Usage: ./setup.sh

set -euo pipefail

# Function to check if required commands are available
function check_dependencies() {
    local dependencies=("yarn" "rm")
    for cmd in "${dependencies[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            echo "Error: $cmd is not installed." >&2
            exit 1
        fi
    done
}

# Function to determine the script directory
function get_script_dir() {
    cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd
}

# Function to clean directories
function cleanup_directories() {
    echo "Removing node_modules, dist, and coverage directories..."
    rm -rf "${SCRIPT_DIR}/node_modules" "${SCRIPT_DIR}/dist" "${SCRIPT_DIR}/coverage"
}

# Function to install dependencies
function install_dependencies() {
    echo "Installing dependencies with yarn..."
    cd "${SCRIPT_DIR}" && yarn install
}

# Main script execution
check_dependencies
SCRIPT_DIR=$(get_script_dir)
cleanup_directories
install_dependencies

echo "Running npx nx reset..."
npx nx reset

echo "Setup complete."
