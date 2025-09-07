#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR" >/dev/null 2>&1
  (cd "$NVM_DIR" && git checkout v0.39.7 >/dev/null 2>&1)
fi
# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

nvm install 20.19.4 >/dev/null
nvm use 20.19.4 >/dev/null

node -v
npm -v

