#!/bin/bash

# Script de sauvegarde des images Fast Foodie
# Sauvegarde les images avec compression et rotation

set -e

# Configuration
IMAGES_DIR="/home/noep/fast-foodie/public/files"
BACKUP_DIR="/home/noep/fast-foodie/backups/images"
MAX_BACKUPS=3  # Garder seulement 3 sauvegardes d'images
COMPRESSION_LEVEL=9  # Compression maximale

# Fonction de logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Fonction d'aide
show_help() {
    echo "🖼️  Script de sauvegarde des images Fast Foodie"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -f, --force    Forcer la sauvegarde même si pas de changements"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Exemples:"
    echo "  $0              # Sauvegarde normale"
    echo "  $0 --force      # Sauvegarde forcée"
    echo "  $0 --verbose    # Mode détaillé"
}

# Variables
FORCE=false
VERBOSE=false

# Traiter les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier que le répertoire des images existe
if [ ! -d "${IMAGES_DIR}" ]; then
    log "❌ Le répertoire des images n'existe pas: ${IMAGES_DIR}"
    exit 1
fi

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

# Nom du fichier de sauvegarde
BACKUP_NAME="images_backup_$(date '+%Y%m%d_%H%M%S').tar.gz"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}"

log "🖼️  Début de la sauvegarde des images..."

# Vérifier s'il y a des images à sauvegarder
IMAGE_COUNT=$(find "${IMAGES_DIR}" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)

if [ "$IMAGE_COUNT" -eq 0 ]; then
    log "ℹ️  Aucune image trouvée dans ${IMAGES_DIR}"
    exit 0
fi

log "📊 Nombre d'images trouvées: ${IMAGE_COUNT}"

# Vérifier s'il y a eu des changements depuis la dernière sauvegarde
if [ "$FORCE" = false ]; then
    LAST_BACKUP=$(ls -t "${BACKUP_DIR}"/images_backup_*.tar.gz 2>/dev/null | head -1)
    if [ -n "$LAST_BACKUP" ]; then
        LAST_BACKUP_TIME=$(stat -c %Y "$LAST_BACKUP")
        IMAGES_MOD_TIME=$(find "${IMAGES_DIR}" -type f -printf '%T@\n' | sort -n | tail -1)
        
        if [ "$IMAGES_MOD_TIME" -le "$LAST_BACKUP_TIME" ]; then
            log "ℹ️  Aucun changement détecté depuis la dernière sauvegarde"
            log "💡 Utilisez --force pour forcer la sauvegarde"
            exit 0
        fi
    fi
fi

# Créer la sauvegarde avec compression maximale
log "💾 Création de la sauvegarde: ${BACKUP_NAME}"

if [ "$VERBOSE" = true ]; then
    tar -czf "${BACKUP_FILE}" \
        --exclude="*.tmp" \
        --exclude="*.temp" \
        --exclude="*.cache" \
        -C "${IMAGES_DIR}" .
else
    tar -czf "${BACKUP_FILE}" \
        --exclude="*.tmp" \
        --exclude="*.temp" \
        --exclude="*.cache" \
        -C "${IMAGES_DIR}" . >/dev/null 2>&1
fi

# Vérifier que la sauvegarde a réussi
if [ ! -f "${BACKUP_FILE}" ]; then
    log "❌ Erreur lors de la création de la sauvegarde"
    exit 1
fi

# Obtenir la taille de la sauvegarde
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "✅ Sauvegarde créée: ${BACKUP_NAME} (${BACKUP_SIZE})"

# Nettoyer les anciennes sauvegardes
log "🧹 Nettoyage des anciennes sauvegardes..."
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/images_backup_*.tar.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    log "🗑️  Suppression de ${TO_DELETE} ancienne(s) sauvegarde(s)..."
    
    ls -1t "${BACKUP_DIR}"/images_backup_*.tar.gz | tail -n "$TO_DELETE" | while read -r file; do
        if [ "$VERBOSE" = true ]; then
            log "🗑️  Suppression: $(basename "$file")"
        fi
        rm -f "$file"
    done
else
    log "ℹ️  Pas de nettoyage nécessaire (${BACKUP_COUNT}/${MAX_BACKUPS} sauvegardes)"
fi

# Afficher les statistiques
log "📊 Statistiques finales:"
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
REMAINING_BACKUPS=$(ls -1 "${BACKUP_DIR}"/images_backup_*.tar.gz 2>/dev/null | wc -l)
log "   📁 Répertoire: ${BACKUP_DIR}"
log "   📦 Taille totale: ${TOTAL_SIZE}"
log "   🗂️  Sauvegardes conservées: ${REMAINING_BACKUPS}/${MAX_BACKUPS}"

log "🎉 Sauvegarde des images terminée avec succès!" 