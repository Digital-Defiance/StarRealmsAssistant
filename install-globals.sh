#!/bin/bash
npm install --global nx
npx update-browserslist-db@latest
npx playwright install-deps
npx playwright install 