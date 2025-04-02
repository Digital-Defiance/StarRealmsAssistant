#!/bin/bash
npm install --global nx
npx --yes update-browserslist-db@latest
npx playwright install-deps
npx playwright install 