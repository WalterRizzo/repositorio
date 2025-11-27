#!/usr/bin/env bash
set -euo pipefail

# Script to configure branch protection for 'produccion' using gh API
if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install from https://cli.github.com/"
  exit 1
fi

OWNER=$(gh repo view --json nameWithOwner -q .nameWithOwner | cut -d'/' -f1)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner | cut -d'/' -f2)

echo "Configuring branch protection for 'produccion' on ${OWNER}/${REPO}"

gh api --method PUT -H "Accept: application/vnd.github+json" \
  /repos/${OWNER}/${REPO}/branches/produccion/protection \
  -f required_status_checks='{ "strict": true, "contexts": ["Build and Deploy"] }' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count": 1}'

echo "Branch protection rule applied: requires status checks (strict), one approving review, admin enforcement."
