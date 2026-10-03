#!/usr/bin/env bash
# Package Trump-Po as an .nsp using the keys dumped from your own Switch.
set -euo pipefail
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Install Node.js LTS from https://nodejs.org first."; exit 1; }
KEYS="${1:-prod.keys}"
[ -f "$KEYS" ] || [ -f "$HOME/.switch/prod.keys" ] || { echo "Missing prod.keys (dump it with Lockpick_RCM)."; exit 1; }
npm install --no-audit --no-fund
npm run build
if [ -f "$KEYS" ]; then npx nxjs-nsp --fat -k "$KEYS"; else npx nxjs-nsp --fat; fi
echo "Done: trump-po.nsp"
