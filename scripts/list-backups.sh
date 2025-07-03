#!/bin/bash

# Script de gestion des sauvegardes Fast Foodie
# Usage: ./list-backups.sh [action]

set -e

# Configuration
BACKUP_DIR="/backups"
ACTION=${1:-"list"}

# Fonction pour afficher l'aide
show_help() {
    echo "🔧 Gestionnaire de sauvegardes Fast Foodie"
    echo ""
    echo "Usage: $0 [action]"
    echo ""
    echo "Actions disponibles:"
    echo "  list          - Lister toutes les sauvegardes (défaut)"
    echo "  info <file>   - Afficher les informations d'une sauvegarde"
    echo "  delete <file> - Supprimer une sauvegarde"
    echo "  download <file> - Télécharger une sauvegarde"
    echo "  cleanup       - Nettoyer les anciennes sauvegardes"
    echo "  stats         - Afficher les statistiques"
    echo ""
    echo "Exemples:"
    echo "  $0 list"
    echo "  $0 info fast_foodie_backup_20241201_020000.sql"
    echo "  $0 delete fast_foodie_backup_20241201_020000.sql"
}

# Fonction pour lister les sauvegardes
list_backups() {
    echo "📋 Liste des sauvegardes disponibles:"
    echo ""
    
    if [ ! -d "${BACKUP_DIR}" ]; then
        echo "❌ Le répertoire de sauvegarde n'existe pas: ${BACKUP_DIR}"
        return 1
    fi
    
    cd "${BACKUP_DIR}"
    
    if [ ! "$(ls -A *.sql 2>/dev/null)" ]; then
        echo "ℹ️  Aucune sauvegarde trouvée"
        return 0
    fi
    
    echo "Nom du fichier                    | Taille    | Date de création"
    echo "----------------------------------|-----------|------------------"
    
    for file in *.sql; do
        if [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            date=$(stat -c %y "$file" | cut -d' ' -f1)
            printf "%-32s | %-9s | %s\n" "$file" "$size" "$date"
        fi
    done
}

# Fonction pour afficher les informations d'une sauvegarde
show_backup_info() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"
        return 1
    fi
    
    if [ ! -f "${BACKUP_DIR}/${file}" ]; then
        echo "❌ Erreur: Le fichier '${file}' n'existe pas"
        return 1
    fi
    
    echo "📄 Informations sur la sauvegarde: ${file}"
    echo ""
    
    local full_path="${BACKUP_DIR}/${file}"
    local size=$(du -h "$full_path" | cut -f1)
    local date_created=$(stat -c %y "$full_path" | cut -d' ' -f1,2)
    local date_modified=$(stat -c %Y "$full_path" | xargs -I {} date -d @{} '+%Y-%m-%d %H:%M:%S')
    
    echo "📊 Taille: $size"
    echo "📅 Créé le: $date_created"
    echo "🔄 Modifié le: $date_modified"
    
    # Analyser le contenu du fichier SQL
    echo ""
    echo "🗄️  Contenu de la base de données:"
    echo "--------------------------------"
    
    # Compter les lignes
    local total_lines=$(wc -l < "$full_path")
    echo "📝 Nombre total de lignes: $total_lines"
    
    # Chercher les tables
    local tables=$(grep -c "CREATE TABLE" "$full_path" 2>/dev/null || echo "0")
    echo "📋 Nombre de tables: $tables"
    
    # Chercher les insertions
    local inserts=$(grep -c "INSERT INTO" "$full_path" 2>/dev/null || echo "0")
    echo "📥 Nombre d'insertions: $inserts"
}

# Fonction pour supprimer une sauvegarde
delete_backup() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"
        return 1
    fi
    
    if [ ! -f "${BACKUP_DIR}/${file}" ]; then
        echo "❌ Erreur: Le fichier '${file}' n'existe pas"
        return 1
    fi
    
    echo "⚠️  ATTENTION: Vous êtes sur le point de supprimer la sauvegarde: ${file}"
    read -p "Êtes-vous sûr? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "${BACKUP_DIR}/${file}"
        echo "✅ Sauvegarde supprimée: ${file}"
    else
        echo "❌ Suppression annulée"
    fi
}

# Fonction pour nettoyer les anciennes sauvegardes
cleanup_backups() {
    echo "🧹 Nettoyage des anciennes sauvegardes..."
    
    if [ ! -d "${BACKUP_DIR}" ]; then
        echo "❌ Le répertoire de sauvegarde n'existe pas"
        return 1
    fi
    
    cd "${BACKUP_DIR}"
    
    # Garder seulement les 7 dernières sauvegardes
    local max_backups=7
    local backup_count=$(ls -1 *.sql 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$max_backups" ]; then
        local to_delete=$((backup_count - max_backups))
        echo "🗑️  Suppression de $to_delete ancienne(s) sauvegarde(s)..."
        
        ls -1t *.sql | tail -n "$to_delete" | while read file; do
            echo "   Suppression: $file"
            rm "$file"
        done
        
        echo "✅ Nettoyage terminé"
    else
        echo "ℹ️  Pas de nettoyage nécessaire ($backup_count sauvegardes)"
    fi
}

# Fonction pour afficher les statistiques
show_stats() {
    echo "📊 Statistiques des sauvegardes:"
    echo ""
    
    if [ ! -d "${BACKUP_DIR}" ]; then
        echo "❌ Le répertoire de sauvegarde n'existe pas"
        return 1
    fi
    
    cd "${BACKUP_DIR}"
    
    local total_files=$(ls -1 *.sql 2>/dev/null | wc -l)
    local total_size=$(du -ch *.sql 2>/dev/null | tail -1 | cut -f1)
    local oldest_file=$(ls -1t *.sql 2>/dev/null | tail -1 2>/dev/null || echo "Aucune")
    local newest_file=$(ls -1t *.sql 2>/dev/null | head -1 2>/dev/null || echo "Aucune")
    
    echo "📁 Nombre total de sauvegardes: $total_files"
    echo "💾 Taille totale: $total_size"
    echo "📅 Plus ancienne: $oldest_file"
    echo "📅 Plus récente: $newest_file"
    
    if [ "$total_files" -gt 0 ]; then
        echo ""
        echo "📈 Répartition par taille:"
        echo "------------------------"
        du -h *.sql | sort -h | while read size file; do
            printf "%-20s | %s\n" "$file" "$size"
        done
    fi
}

# Gestion des actions
case "$ACTION" in
    "list")
        list_backups
        ;;
    "info")
        show_backup_info "$2"
        ;;
    "delete")
        delete_backup "$2"
        ;;
    "cleanup")
        cleanup_backups
        ;;
    "stats")
        show_stats
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Action non reconnue: $ACTION"
        echo ""
        show_help
        exit 1
        ;;
esac 