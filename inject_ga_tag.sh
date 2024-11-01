#!/bin/bash

# Check if the GA_TAG_ID environment variable is set
if [ -z "$GA_TAG_ID" ]; then
  echo "Error: GA_TAG_ID environment variable is not set."
  exit 1
fi

# Define the path to the index.html file
INDEX_FILE="dist/dominion-assistant/index.html"

# Check if the index.html file exists
if [ ! -f "$INDEX_FILE" ]; then
  echo "Error: $INDEX_FILE does not exist. Please run 'yarn build' first."
  exit 1
fi

# Define the Google Analytics script block
GA_SCRIPT=$(cat <<EOF
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=$GA_TAG_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '$GA_TAG_ID');
</script>
EOF
)

# Use awk to insert the GA script before the closing </head> tag
awk -v ga_script="$GA_SCRIPT" '
/<\/head>/ {
  print ga_script
}
{ print }
' "$INDEX_FILE" > "$INDEX_FILE.tmp" && mv "$INDEX_FILE.tmp" "$INDEX_FILE"

if [ $? -ne 0 ]; then
  echo "Error: Failed to inject Google Analytics tag."
  exit 1
fi
echo "Google Analytics tag injected successfully."