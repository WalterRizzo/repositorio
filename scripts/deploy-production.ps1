param(
    [switch]$SkipConfirm
)

if (-not $SkipConfirm) {
    $resp = Read-Host "This will build and deploy to Cloudflare using ./wrangler.json. Continue? (y/N)"
    if ($resp -ne 'y' -and $resp -ne 'Y') { Write-Host 'Cancelled'; exit 1 }
}

node .\scripts\ensure-wrangler-config.js
npm run build
npx wrangler deploy --config ./wrangler.json
