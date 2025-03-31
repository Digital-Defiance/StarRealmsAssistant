#!/bin/sh
source .env
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

if [ -d /usr/local/share/nvm ]; then
  export NVM_DIR=/usr/local/share/nvm
  sudo chmod -R 755 /usr/local/share/nvm
else
  export NVM_DIR="$HOME/.nvm"
fi
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install ${DEFAULT_NVM_VERSION} && nvm use ${DEFAULT_NVM_VERSION}