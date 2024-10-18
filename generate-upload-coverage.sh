#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
nx test && bash <(curl -Ls https://coverage.codacy.com/get.sh) report -r ${SCRIPT_DIR}/coverage/dominion-assistant/lcov.info
