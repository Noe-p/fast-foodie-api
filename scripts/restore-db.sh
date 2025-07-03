#!/bin/bash

# Script de restauration de la base de données Fast Foodie
# Usage: ./restore-db.sh <backup_file>

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST=${DB_HOST:-"fast-foodie-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"fast_foodie"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-""}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez spécifier le fichier de sauvegarde"
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Fichiers de sauvegarde disponibles:"
    ls -la "${BACKUP_DIR}"/*.sql 2>/dev/null || echo "Aucun fichier de sauvegarde trouvé"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier si le fichier existe
if [ ! -f "${BACKUP_FILE}" ]; then
    # Essayer avec le répertoire de sauvegarde
    if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
        echo "❌ Erreur: Le fichier de sauvegarde '${BACKUP_FILE}' n'existe pas"
        exit 1
    else
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
    fi
fi

echo "🚀 Début de la restauration de la base de données..."
echo "📄 Fichier de sauvegarde: ${BACKUP_FILE}"
echo "🗄️  Base de données cible: ${DB_NAME}"

# Demander confirmation
read -p "⚠️  ATTENTION: Cette opération va écraser la base de données actuelle. Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 1
fi

# Créer une sauvegarde de sécurité avant restauration
echo "💾 Création d'une sauvegarde de sécurité..."
SAFETY_BACKUP="${BACKUP_DIR}/safety_backup_$(date +%Y%m%d_%H%M%S).sql"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="${SAFETY_BACKUP}"

echo "✅ Sauvegarde de sécurité créée: ${SAFETY_BACKUP}"

# Effectuer la restauration
echo "🔄 Restauration de la base de données..."

PGPASSWORD="${DB_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "postgres" \
    -f "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Restauration terminée avec succès!"
    echo "📊 Base de données '${DB_NAME}' restaurée depuis '${BACKUP_FILE}'"
else
    echo "❌ Erreur lors de la restauration"
    echo "💡 Vous pouvez restaurer la sauvegarde de sécurité: ${SAFETY_BACKUP}"
    exit 1
fi 