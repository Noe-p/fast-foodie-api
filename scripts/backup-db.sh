#!/bin/bash

# Script de sauvegarde de la base de données Fast Foodie
# Usage: ./backup-db.sh [backup_name]

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MAX_BACKUPS=7  # Garder 7 jours de sauvegardes
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=${1:-"fast_foodie_backup_${DATE}"}
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"

# Charger les variables d'environnement depuis .env si le fichier existe
if [ -f ".env" ]; then
    echo "📄 Chargement des variables d'environnement depuis .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Variables d'environnement (avec fallback vers les valeurs par défaut)
DB_HOST=${TYPEORM_HOST:-"fast-foodie-db"}
DB_PORT=${TYPEORM_PORT:-"5432"}
DB_NAME=${TYPEORM_DATABASE:-"fast_foodie_db"}
DB_USER=${TYPEORM_USERNAME:-"postgres"}
DB_PASSWORD=${TYPEORM_PASSWORD:-""}

echo "🔧 Configuration de la base de données:"
echo "  Host: ${DB_HOST}"
echo "  Port: ${DB_PORT}"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"

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

# Utiliser pg_dump via Docker en passant les variables d'environnement
# Le conteneur PostgreSQL utilise les variables POSTGRES_USER, POSTGRES_PASSWORD, etc.
docker exec -e PGPASSWORD="${DB_PASSWORD}" fast-foodie-db pg_dump \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    --format=plain \
    > "${BACKUP_FILE}"

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