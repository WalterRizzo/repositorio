#!/bin/bash

# Script para configurar la aplicación ExpenseFlow en producción
# Ejecutar este script después de configurar las variables de entorno

echo "🚀 Configurando ExpenseFlow para producción..."

# Verificar que wrangler esté configurado
echo "📋 Verificando configuración de Wrangler..."
npx wrangler auth login

echo "🔑 Configurando variables de entorno en producción..."
echo "Por favor, ejecuta los siguientes comandos con tus valores reales:"
echo ""
echo "npx wrangler secret put MOCHA_USERS_SERVICE_API_URL"
echo "npx wrangler secret put MOCHA_USERS_SERVICE_API_KEY"
echo ""
echo "Valores sugeridos:"
echo "MOCHA_USERS_SERVICE_API_URL: https://users-service.getmocha.com/api"
echo "MOCHA_USERS_SERVICE_API_KEY: (tu clave de API desde getmocha.com)"
echo ""

read -p "¿Has configurado las variables de entorno? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Por favor configura las variables de entorno primero"
    exit 1
fi

echo "🏗️  Construyendo la aplicación..."
npm run build

echo "🚀 Desplegando a Cloudflare Workers..."
npx wrangler deploy

echo "✅ ¡ExpenseFlow desplegado exitosamente!"
echo "🌐 Tu aplicación estará disponible en breve en tu dominio de Cloudflare Workers"
