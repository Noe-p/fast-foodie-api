#!/bin/bash

# Script de gestion des sauvegardes d'images Fast Foodie
# Liste, affiche les infos et supprime les sauvegardes d'images

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
    echo "🖼️  Gestionnaire de sauvegardes d'images Fast Foodie"
    echo ""
    echo "Usage: $0 [commande] [options]"
    echo ""
    echo "Commandes:"
    echo "  list                    - Lister toutes les sauvegardes (défaut)"
    echo "  info <fichier>          - Afficher les infos d'une sauvegarde"
    echo "  delete <fichier>        - Supprimer une sauvegarde"
    echo "  cleanup                 - Nettoyer les anciennes sauvegardes"
    echo "  stats                   - Afficher les statistiques"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Exemples:"
    echo "  $0 list"
    echo "  $0 info images_backup_20240115_020000.tar.gz"
    echo "  $0 delete images_backup_20240115_020000.tar.gz"
    echo "  $0 cleanup"
}

# Variables
VERBOSE=false
COMMAND="list"

# Traiter les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        list|info|delete|cleanup|stats)
            COMMAND="$1"
            shift
            ;;
        -*)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
        *)
            if [ "$COMMAND" = "info" ] || [ "$COMMAND" = "delete" ]; then
                FILE="$1"
            else
                echo "❌ Argument inattendu: $1"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Vérifier que le répertoire de sauvegarde existe
if [ ! -d "$BACKUP_DIR" ]; then
    log "❌ Le répertoire de sauvegarde n'existe pas: ${BACKUP_DIR}"
    exit 1
fi

# Fonction pour lister les sauvegardes
list_backups() {
    echo "📋 Sauvegardes d'images disponibles:"
    echo ""
    
    if [ ! "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "   Aucune sauvegarde trouvée"
        return
    fi
    
    # Lister les sauvegardes avec détails
    for file in "$BACKUP_DIR"/images_backup_*.tar.gz; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            size=$(du -h "$file" | cut -f1)
            date=$(stat -c %y "$file" | cut -d' ' -f1)
            time=$(stat -c %y "$file" | cut -d' ' -f2 | cut -d'.' -f1)
            
            echo "   📦 ${filename}"
            echo "      📏 Taille: ${size}"
            echo "      📅 Date: ${date} à ${time}"
            echo ""
        fi
    done
}

# Fonction pour afficher les infos d'une sauvegarde
info_backup() {
    local file="$1"
    local filepath="${BACKUP_DIR}/${file}"
    
    if [ ! -f "$filepath" ]; then
        log "❌ Le fichier de sauvegarde n'existe pas: ${file}"
        return 1
    fi
    
    echo "📊 Informations de la sauvegarde: ${file}"
    echo ""
    
    # Informations de base
    size=$(du -h "$filepath" | cut -f1)
    date=$(stat -c %y "$filepath" | cut -d' ' -f1)
    time=$(stat -c %y "$filepath" | cut -d' ' -f2 | cut -d'.' -f1)
    
    echo "   📦 Fichier: ${file}"
    echo "   📏 Taille: ${size}"
    echo "   📅 Date: ${date} à ${time}"
    echo ""
    
    # Contenu de la sauvegarde (si verbose)
    if [ "$VERBOSE" = true ]; then
        echo "📁 Contenu de la sauvegarde:"
        tar -tzf "$filepath" | head -20 | while read -r line; do
            echo "   📄 ${line}"
        done
        
        if [ "$(tar -tzf "$filepath" | wc -l)" -gt 20 ]; then
            echo "   ... et $(($(tar -tzf "$filepath" | wc -l) - 20)) autres fichiers"
        fi
        echo ""
    fi
}

# Fonction pour supprimer une sauvegarde
delete_backup() {
    local file="$1"
    local filepath="${BACKUP_DIR}/${file}"
    
    if [ ! -f "$filepath" ]; then
        log "❌ Le fichier de sauvegarde n'existe pas: ${file}"
        return 1
    fi
    
    echo "🗑️  Suppression de la sauvegarde: ${file}"
    
    # Demander confirmation
    read -p "Êtes-vous sûr de vouloir supprimer cette sauvegarde? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$filepath"
        log "✅ Sauvegarde supprimée: ${file}"
    else
        log "❌ Suppression annulée"
    fi
}

# Fonction pour nettoyer les anciennes sauvegardes
cleanup_backups() {
    echo "🧹 Nettoyage des anciennes sauvegardes..."
    
    # Garder seulement les 3 plus récentes
    MAX_BACKUPS=3
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/images_backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
        echo "🗑️  Suppression de ${TO_DELETE} ancienne(s) sauvegarde(s)..."
        
        ls -1t "$BACKUP_DIR"/images_backup_*.tar.gz | tail -n "$TO_DELETE" | while read -r file; do
            filename=$(basename "$file")
            if [ "$VERBOSE" = true ]; then
                echo "   🗑️  Suppression: ${filename}"
            fi
            rm -f "$file"
        done
        
        log "✅ Nettoyage terminé"
    else
        log "ℹ️  Pas de nettoyage nécessaire (${BACKUP_COUNT}/${MAX_BACKUPS} sauvegardes)"
    fi
}

# Fonction pour afficher les statistiques
stats_backups() {
    echo "📊 Statistiques des sauvegardes d'images:"
    echo ""
    
    if [ ! "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "   Aucune sauvegarde trouvée"
        return
    fi
    
    # Statistiques générales
    TOTAL_FILES=$(ls -1 "$BACKUP_DIR"/images_backup_*.tar.gz 2>/dev/null | wc -l)
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    
    echo "   📦 Nombre total de sauvegardes: ${TOTAL_FILES}"
    echo "   📏 Taille totale: ${TOTAL_SIZE}"
    echo ""
    
    # Plus ancienne et plus récente
    OLDEST=$(ls -t "$BACKUP_DIR"/images_backup_*.tar.gz 2>/dev/null | tail -1)
    NEWEST=$(ls -t "$BACKUP_DIR"/images_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$OLDEST" ] && [ -n "$NEWEST" ]; then
        OLDEST_DATE=$(stat -c %y "$OLDEST" | cut -d' ' -f1)
        NEWEST_DATE=$(stat -c %y "$NEWEST" | cut -d' ' -f1)
        
        echo "   📅 Plus ancienne: $(basename "$OLDEST") (${OLDEST_DATE})"
        echo "   📅 Plus récente: $(basename "$NEWEST") (${NEWEST_DATE})"
    fi
}

# Exécuter la commande demandée
case "$COMMAND" in
    "list")
        list_backups
        ;;
    "info")
        if [ -z "$FILE" ]; then
            echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"
            echo "Usage: $0 info <fichier>"
            exit 1
        fi
        info_backup "$FILE"
        ;;
    "delete")
        if [ -z "$FILE" ]; then
            echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"
            echo "Usage: $0 delete <fichier>"
            exit 1
        fi
        delete_backup "$FILE"
        ;;
    "cleanup")
        cleanup_backups
        ;;
    "stats")
        stats_backups
        ;;
    *)
        echo "❌ Commande non reconnue: $COMMAND"
        show_help
        exit 1
        ;;
esac 