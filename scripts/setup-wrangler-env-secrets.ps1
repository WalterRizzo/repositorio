if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI 'gh' not found. Install from https://cli.github.com/."
  exit 1
}

$envName = 'production'
Write-Host "Setting environment-level secrets for environment: $envName"

$apiToken = $env:CF_API_TOKEN
if (-not $apiToken) { $apiToken = Read-Host -AsSecureString "Introduce CF_API_TOKEN (token API de Cloudflare)"; $apiToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiToken)) }

$accountId = $env:CF_ACCOUNT_ID
if (-not $accountId) { $accountId = Read-Host "Introduce CF_ACCOUNT_ID (Account ID)" }

gh secret set CF_API_TOKEN --env $envName --body "$apiToken"
gh secret set CF_ACCOUNT_ID --env $envName --body "$accountId"

Write-Host "Environment-level secrets created for $envName"
