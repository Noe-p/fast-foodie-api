#!/bin/bash

# Script de sauvegarde de la base de données Fast Foodie
# Usage: ./backup-db.sh [backup_name]

set -e

# Configuration
BACKUP_DIR="/backups"
MAX_BACKUPS=7  # Garder 7 jours de sauvegardes
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=${1:-"fast_foodie_backup_${DATE}"}
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"

# Variables d'environnement (seront définies dans le container)
DB_HOST=${DB_HOST:-"fast-foodie-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"fast_foodie"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-""}

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

echo "🚀 Début de la sauvegarde de la base de données..."
echo "📁 Répertoire de sauvegarde: ${BACKUP_DIR}"
echo "📄 Fichier de sauvegarde: ${BACKUP_FILE}"

# Fonction pour nettoyer les anciennes sauvegardes
cleanup_old_backups() {
    echo "🧹 Nettoyage des anciennes sauvegardes..."
    cd "${BACKUP_DIR}"
    
    # Compter le nombre de fichiers de sauvegarde
    BACKUP_COUNT=$(ls -1 *.sql 2>/dev/null | wc -l)
    
    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        # Supprimer les plus anciens fichiers
        ls -1t *.sql | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        echo "✅ Anciennes sauvegardes supprimées"
    else
        echo "ℹ️  Pas de nettoyage nécessaire ($BACKUP_COUNT sauvegardes)"
    fi
}

# Effectuer la sauvegarde
echo "💾 Création du dump de la base de données..."

# Utiliser pg_dump avec les variables d'environnement
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
    --file="${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée avec succès: ${BACKUP_FILE}"
    
    # Obtenir la taille du fichier
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "📊 Taille du fichier: ${FILE_SIZE}"
    
    # Nettoyer les anciennes sauvegardes
    cleanup_old_backups
    
    echo "🎉 Sauvegarde terminée avec succès!"
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi 