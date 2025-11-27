#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found. Install from https://cli.github.com/"
  exit 1
fi

ENV_NAME=production
echo "Setting environment-level secrets for environment: $ENV_NAME"

if [ -z "${CF_API_TOKEN:-}" ]; then
  read -rsp "Introduce CF_API_TOKEN (token API de Cloudflare): " CF_API_TOKEN
  echo
fi

if [ -z "${CF_ACCOUNT_ID:-}" ]; then
  read -p "Introduce CF_ACCOUNT_ID (Account ID): " CF_ACCOUNT_ID
fi

echo "$CF_API_TOKEN" | gh secret set CF_API_TOKEN --env $ENV_NAME --body -
echo "$CF_ACCOUNT_ID" | gh secret set CF_ACCOUNT_ID --env $ENV_NAME --body -

echo "Environment-level secrets created for $ENV_NAME"
