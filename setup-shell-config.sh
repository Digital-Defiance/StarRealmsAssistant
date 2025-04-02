#!/bin/bash

echo "Starting shell configuration setup..."

# Define the line to source environment variables from the .env file if it exists
# Using '.' (source) handles quotes correctly, unlike 'export $(... | xargs)'
EXPORT_LINE='[ -f "${DOTENV_CONFIG_PATH}" ] && set -a && . "${DOTENV_CONFIG_PATH}" && set +a'

# Function to append the source line to a shell config file if it doesn't already contain it
append_source_line() {
  local file="$1"
  echo "Checking $file..."
  # Use grep -qF to check for the exact fixed string
  if [ ! -f "$file" ] || ! grep -qF -- "$EXPORT_LINE" "$file"; then
    echo "$EXPORT_LINE" >> "$file"
    echo "Appended source line to $file"
  else
    echo "Source line already exists in $file"
  fi
}

# Append the source line to .zshrc and .bashrc
append_source_line "$HOME/.zshrc"
append_source_line "$HOME/.bashrc"

echo "Shell configuration setup complete."
