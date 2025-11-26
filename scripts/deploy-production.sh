#!/usr/bin/env bash
set -euo pipefail
node ./scripts/ensure-wrangler-config.js
npm run build
npx wrangler deploy --config ./wrangler.json
