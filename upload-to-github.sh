#!/bin/bash
# Script para subir proyecto a GitHub usando GitHub CLI

# Verificar si GitHub CLI está instalado
gh --version

# Crear repositorio en GitHub y subirlo
gh repo create expense-tharsis-app --public --source=. --remote=origin --push

echo "✅ Proyecto subido exitosamente a GitHub!"