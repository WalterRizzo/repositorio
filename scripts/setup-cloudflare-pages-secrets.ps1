<#
.SYNOPSIS
  Script para configurar los secrets de GitHub Actions para Cloudflare Pages (PowerShell)

Requisitos:
  - GitHub CLI instalado (https://cli.github.com/)
  - Estar autenticado con 'gh auth login' en una cuenta con permisos sobre el repo

Uso:
  Desde la raíz del repo ejecuta:
    pwsh ./scripts/setup-cloudflare-pages-secrets.ps1

  El script pedirá los tres valores y los configurará como secrets de repo.
  También puedes exportar variables CF_PAGES_API_TOKEN, CF_ACCOUNT_ID, CF_PAGES_PROJECT antes de ejecutar si prefieres no introducirlos interactivamente.
#>

function Ensure-GhAvailable {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Error "GitHub CLI 'gh' no encontrado. Instálalo desde https://cli.github.com/ y vuelve a intentarlo."
        exit 1
    }
}

Ensure-GhAvailable

Write-Host "Configuración automática de secrets para Cloudflare Pages (GitHub CLI)"

$token = $env:CF_PAGES_API_TOKEN
if (-not $token) { $token = Read-Host -AsSecureString "Introduce CF_PAGES_API_TOKEN (token API Pages)"; $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)) }

$accountId = $env:CF_ACCOUNT_ID
if (-not $accountId) { $accountId = Read-Host "Introduce CF_ACCOUNT_ID (Account ID)" }

$project = $env:CF_PAGES_PROJECT
if (-not $project) { $project = Read-Host "Introduce CF_PAGES_PROJECT (Pages project name)" }

Write-Host "Creando/actualizando secrets..."

# gh secret set usa --body o stdin
gh secret set CF_PAGES_API_TOKEN --body "$token"
gh secret set CF_ACCOUNT_ID --body "$accountId"
gh secret set CF_PAGES_PROJECT --body "$project"

Write-Host "Secrets instalados. Verifica en: https://github.com/<tu-usuario>/<tu-repo>/settings/secrets and variables/actions"

Write-Host "Listo — ahora cada push a la rama 'produccion' hará build y (si los secrets están presentes) desplegará a Cloudflare Pages"
