#!/bin/bash

# Script de restauration des images Fast Foodie
# Restaure les images depuis une sauvegarde tar.gz

set -e

# Configuration
IMAGES_DIR="/home/noep/fast-foodie/public/files"
BACKUP_DIR="/home/noep/fast-foodie/backups/images"

# Fonction de logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Fonction d'aide
show_help() {
    echo "🖼️  Script de restauration des images Fast Foodie"
    echo ""
    echo "Usage: $0 <fichier_sauvegarde> [options]"
    echo ""
    echo "Arguments:"
    echo "  fichier_sauvegarde    Nom du fichier de sauvegarde (ex: images_backup_20240115_020000.tar.gz)"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -f, --force    Forcer la restauration sans confirmation"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Exemples:"
    echo "  $0 images_backup_20240115_020000.tar.gz"
    echo "  $0 images_backup_20240115_020000.tar.gz --force"
    echo "  $0 images_backup_20240115_020000.tar.gz --verbose"
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
        -*)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# Vérifier qu'un fichier de sauvegarde a été spécifié
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"
    show_help
    exit 1
fi

# Chemin complet du fichier de sauvegarde
if [[ "$BACKUP_FILE" == /* ]]; then
    # Chemin absolu
    BACKUP_PATH="$BACKUP_FILE"
else
    # Chemin relatif
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Vérifier que le fichier de sauvegarde existe
if [ ! -f "$BACKUP_PATH" ]; then
    log "❌ Le fichier de sauvegarde n'existe pas: ${BACKUP_PATH}"
    log "📋 Sauvegardes disponibles:"
    ls -la "${BACKUP_DIR}"/images_backup_*.tar.gz 2>/dev/null || echo "   Aucune sauvegarde trouvée"
    exit 1
fi

log "🖼️  Début de la restauration des images..."

# Créer une sauvegarde de sécurité avant restauration
SAFETY_BACKUP="images_safety_$(date '+%Y%m%d_%H%M%S').tar.gz"
SAFETY_PATH="${BACKUP_DIR}/${SAFETY_BACKUP}"

if [ -d "$IMAGES_DIR" ] && [ "$(ls -A "$IMAGES_DIR" 2>/dev/null)" ]; then
    log "🛡️  Création d'une sauvegarde de sécurité: ${SAFETY_BACKUP}"
    
    if [ "$VERBOSE" = true ]; then
        tar -czf "$SAFETY_PATH" -C "$IMAGES_DIR" .
    else
        tar -czf "$SAFETY_PATH" -C "$IMAGES_DIR" . >/dev/null 2>&1
    fi
    
    log "✅ Sauvegarde de sécurité créée: ${SAFETY_BACKUP}"
fi

# Demander confirmation sauf si --force
if [ "$FORCE" = false ]; then
    echo ""
    echo "⚠️  ATTENTION: Cette opération va remplacer toutes les images actuelles!"
    echo "📁 Répertoire de destination: ${IMAGES_DIR}"
    echo "📦 Fichier de sauvegarde: ${BACKUP_FILE}"
    echo ""
    read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "❌ Restauration annulée par l'utilisateur"
        exit 1
    fi
fi

# Créer le répertoire de destination s'il n'existe pas
mkdir -p "$IMAGES_DIR"

# Sauvegarder les images actuelles si elles existent
if [ -d "$IMAGES_DIR" ] && [ "$(ls -A "$IMAGES_DIR" 2>/dev/null)" ]; then
    log "📦 Sauvegarde des images actuelles..."
    CURRENT_BACKUP="images_current_$(date '+%Y%m%d_%H%M%S').tar.gz"
    CURRENT_PATH="${BACKUP_DIR}/${CURRENT_BACKUP}"
    
    if [ "$VERBOSE" = true ]; then
        tar -czf "$CURRENT_PATH" -C "$IMAGES_DIR" .
    else
        tar -czf "$CURRENT_PATH" -C "$IMAGES_DIR" . >/dev/null 2>&1
    fi
    
    log "✅ Images actuelles sauvegardées: ${CURRENT_BACKUP}"
fi

# Vider le répertoire de destination
log "🧹 Nettoyage du répertoire de destination..."
rm -rf "$IMAGES_DIR"/*
mkdir -p "$IMAGES_DIR"

# Restaurer les images
log "🔄 Restauration des images depuis: ${BACKUP_FILE}"

if [ "$VERBOSE" = true ]; then
    tar -xzf "$BACKUP_PATH" -C "$IMAGES_DIR"
else
    tar -xzf "$BACKUP_PATH" -C "$IMAGES_DIR" >/dev/null 2>&1
fi

# Vérifier que la restauration a réussi
RESTORED_COUNT=$(find "$IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)

if [ "$RESTORED_COUNT" -eq 0 ]; then
    log "⚠️  Aucune image restaurée. Vérifiez le contenu de la sauvegarde."
else
    log "✅ Restauration terminée: ${RESTORED_COUNT} image(s) restaurée(s)"
fi

# Afficher les informations finales
log "📊 Informations finales:"
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "   📦 Taille de la sauvegarde: ${BACKUP_SIZE}"
log "   📁 Répertoire de destination: ${IMAGES_DIR}"
log "   🖼️  Images restaurées: ${RESTORED_COUNT}"

log "🎉 Restauration des images terminée avec succès!"
log "💡 Sauvegarde de sécurité conservée: ${SAFETY_BACKUP}" 