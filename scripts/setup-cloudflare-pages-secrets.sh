#!/usr/bin/env bash
#
# Script para configurar secrets de GitHub Actions para Cloudflare Pages (bash)
# Requisitos:
#  - GitHub CLI instalado (https://cli.github.com/)
#  - Estar autenticado con 'gh auth login' con un usuario que tenga permisos en el repo
#
set -euo pipefail

echo "Configuración automática de secrets para Cloudflare Pages via gh (bash)"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh (GitHub CLI) no encontrado. Instálalo: https://cli.github.com/"
  exit 1
fi

if [ -z "${CF_PAGES_API_TOKEN:-}" ]; then
  read -rsp "Introduce CF_PAGES_API_TOKEN (token API Pages): " CF_PAGES_API_TOKEN
  echo
fi

if [ -z "${CF_ACCOUNT_ID:-}" ]; then
  read -p "Introduce CF_ACCOUNT_ID (Account ID): " CF_ACCOUNT_ID
fi

if [ -z "${CF_PAGES_PROJECT:-}" ]; then
  read -p "Introduce CF_PAGES_PROJECT (Pages project name): " CF_PAGES_PROJECT
fi

echo "Creando/actualizando secrets..."

echo "$CF_PAGES_API_TOKEN" | gh secret set CF_PAGES_API_TOKEN --body -
echo "$CF_ACCOUNT_ID" | gh secret set CF_ACCOUNT_ID --body -
echo "$CF_PAGES_PROJECT" | gh secret set CF_PAGES_PROJECT --body -

echo "Secrets instalados. Verifica en: https://github.com/<tu-usuario>/<tu-repo>/settings/secrets and variables/actions"
echo "Listo — ahora cada push a la rama 'produccion' hará build y (si los secrets están presentes) desplegará a Cloudflare Pages"
