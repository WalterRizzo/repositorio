# Script para configurar la aplicación ExpenseFlow en producción (Windows)
# Ejecutar este script después de configurar las variables de entorno

Write-Host "🚀 Configurando ExpenseFlow para producción..." -ForegroundColor Green

# Verificar que wrangler esté configurado
Write-Host "📋 Verificando configuración de Wrangler..." -ForegroundColor Yellow
npx wrangler whoami

Write-Host ""
Write-Host "🔑 Para configurar las variables de entorno en producción, ejecuta:" -ForegroundColor Cyan  
Write-Host ""
Write-Host "npx wrangler secret put MOCHA_USERS_SERVICE_API_URL" -ForegroundColor White
Write-Host "npx wrangler secret put MOCHA_USERS_SERVICE_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Valores sugeridos:" -ForegroundColor Yellow
Write-Host "MOCHA_USERS_SERVICE_API_URL: https://users-service.getmocha.com/api" -ForegroundColor White 
Write-Host "MOCHA_USERS_SERVICE_API_KEY: (tu clave de API desde getmocha.com)" -ForegroundColor White   
Write-Host ""

$response = Read-Host "¿Has configurado las variables de entorno? (y/N)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "❌ Por favor configura las variables de entorno primero" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️  Construyendo la aplicación..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Desplegando a Cloudflare Workers..." -ForegroundColor Yellow
npx wrangler deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡ExpenseFlow desplegado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 Tu aplicación estará disponible en breve en tu dominio de Cloudflare Workers" -Foregr
roundColor Cyan
} else {
    Write-Host "❌ Error al desplegar la aplicación" -ForegroundColor Red
    exit 1
}
