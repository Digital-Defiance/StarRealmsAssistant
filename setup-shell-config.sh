#!/bin/sh

echo "Starting shell configuration setup..."

# Define the line to export environment variables from the .env file
EXPORT_LINE="export \$(grep -v '^#' \${DOTENV_CONFIG_PATH} | xargs)"

# Function to append the export line to a shell config file if it doesn't already contain it
append_export_line() {
  local file="$1"
  echo "Checking $file..."
  if [ ! -f "$file" ] || ! grep -qF "$EXPORT_LINE" "$file"; then
    echo "$EXPORT_LINE" >> "$file"
    echo "Appended export line to $file"
  else
    echo "Export line already exists in $file"
  fi
}

# Append the export line to .zshrc and .bashrc
append_export_line "$HOME/.zshrc"
append_export_line "$HOME/.bashrc"

echo "Shell configuration setup complete."