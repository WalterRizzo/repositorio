<#
  PowerShell helper para añadir secrets de Wrangler/Cloudflare al repo via gh CLI
  Requisitos: gh (GitHub CLI) instalado y `gh auth login` autenticado

  Usa: pwsh ./scripts/setup-wrangler-secrets.ps1
#>
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI 'gh' no encontrado. Instálalo desde https://cli.github.com/."
  exit 1
}

Write-Host "Configurar secrets para Wrangler deploy"

$apiToken = $env:CF_API_TOKEN
if (-not $apiToken) { $apiToken = Read-Host -AsSecureString "Introduce CF_API_TOKEN (token API de Cloudflare)"; $apiToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiToken)) }

$accountId = $env:CF_ACCOUNT_ID
if (-not $accountId) { $accountId = Read-Host "Introduce CF_ACCOUNT_ID (Account ID)" }

Write-Host "Creando secrets..."
gh secret set CF_API_TOKEN --body "$apiToken"
gh secret set CF_ACCOUNT_ID --body "$accountId"

Write-Host "Secrets de Wrangler configurados en GitHub Actions."
