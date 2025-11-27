if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI 'gh' not found. Install from https://cli.github.com/."
  exit 1
}

$info = gh repo view --json nameWithOwner -q .nameWithOwner
$parts = $info -split '/' 
$owner = $parts[0]
$repo = $parts[1]

Write-Host "Configuring branch protection for 'produccion' on $owner/$repo"

gh api --method PUT -H "Accept: application/vnd.github+json" "/repos/$owner/$repo/branches/produccion/protection" -f required_status_checks='{ "strict": true, "contexts": ["Build and Deploy"] }' -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count": 1}'

Write-Host "Branch protection applied: strict status checks, 1 approving review, admin enforcement"
