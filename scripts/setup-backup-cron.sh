#!/bin/bash

# Script de configuration des sauvegardes automatiques
# Usage: ./setup-backup-cron.sh [frequency] [HH:MM]

set -e

# Configuration par défaut
FREQUENCY=${1:-"daily"}  # daily, weekly, monthly
BACKUP_TIME=${2:-"02:00"}  # Heure de sauvegarde (format HH:MM)

# Extraire heure et minute
CRON_HOUR=$(echo "$BACKUP_TIME" | cut -d: -f1)
CRON_MIN=$(echo "$BACKUP_TIME" | cut -d: -f2)

echo "🚀 Configuration des sauvegardes automatiques..."
echo "⏰ Fréquence: ${FREQUENCY}"
echo "🕐 Heure: ${BACKUP_TIME}"

# Créer le script de sauvegarde cron
CRON_SCRIPT="/tmp/fast-foodie-backup-cron.sh"

cat > "${CRON_SCRIPT}" << 'EOF'
#!/bin/bash

# Script de sauvegarde automatique pour Fast Foodie
# Ce script est exécuté par cron

# Variables d'environnement
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Répertoire du projet
PROJECT_DIR="/home/noep/fast-foodie"
LOG_FILE="/home/noep/fast-foodie/backup.log"

# Créer le répertoire de logs s'il n'existe pas
mkdir -p "$(dirname "${LOG_FILE}")"

# Fonction de logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log "🚀 Début de la sauvegarde automatique"

# Aller dans le répertoire du projet
cd "${PROJECT_DIR}" || {
    log "❌ Erreur: Impossible d'accéder au répertoire ${PROJECT_DIR}"
    exit 1
}

# Vérifier que docker compose est disponible
if ! command -v docker &> /dev/null; then
    log "❌ Erreur: docker n'est pas installé"
    exit 1
fi

# Exécuter la sauvegarde
log "💾 Lancement du script de sauvegarde..."

# Variables d'environnement pour la sauvegarde
export BACKUP_DIR="${PROJECT_DIR}/backups"

# Charger les variables depuis .env
if [ -f "${PROJECT_DIR}/.env" ]; then
    export DB_HOST="$(grep TYPEORM_HOST .env | cut -d'=' -f2)"
    export DB_PORT="$(grep TYPEORM_PORT .env | cut -d'=' -f2)"
    export DB_USER="$(grep TYPEORM_USERNAME .env | cut -d'=' -f2)"
    export DB_PASSWORD="$(grep TYPEORM_PASSWORD .env | cut -d'=' -f2)"
    export DB_NAME="$(grep TYPEORM_DATABASE .env | cut -d'=' -f2)"
else
    echo "❌ Fichier .env non trouvé dans ${PROJECT_DIR}"
    exit 1
fi

if [ -f "${PROJECT_DIR}/scripts/backup-db.sh" ]; then
    cd "${PROJECT_DIR}"
    chmod +x scripts/backup-db.sh
    if ./scripts/backup-db.sh; then
        log "✅ Sauvegarde terminée avec succès"
        
        # Nettoyer les anciennes sauvegardes (garder 7 jours)
        log "🧹 Nettoyage des anciennes sauvegardes..."
        cd backups
        BACKUP_COUNT=$(ls -1 *.sql 2>/dev/null | wc -l)
        if [ "$BACKUP_COUNT" -gt 7 ]; then
            ls -1t *.sql | tail -n +8 | xargs rm -f
            log "✅ Nettoyage terminé"
        else
            log "ℹ️  Pas de nettoyage nécessaire ($BACKUP_COUNT sauvegardes)"
        fi
    else
        log "❌ Erreur lors de la sauvegarde"
        exit 1
    fi
else
    log "❌ Script de sauvegarde non trouvé: ${PROJECT_DIR}/scripts/backup-db.sh"
    exit 1
fi

log "🎉 Sauvegarde automatique terminée"
EOF

# Rendre le script exécutable
chmod +x "${CRON_SCRIPT}"

# Configurer la tâche cron selon la fréquence
case "${FREQUENCY}" in
    "daily")
        CRON_SCHEDULE="${CRON_MIN} ${CRON_HOUR} * * *"
        echo "📅 Configuration: Sauvegarde quotidienne à ${BACKUP_TIME}"
        ;;
    "weekly")
        CRON_SCHEDULE="${CRON_MIN} ${CRON_HOUR} * * 0"
        echo "📅 Configuration: Sauvegarde hebdomadaire le dimanche à ${BACKUP_TIME}"
        ;;
    "monthly")
        CRON_SCHEDULE="${CRON_MIN} ${CRON_HOUR} 1 * *"
        echo "📅 Configuration: Sauvegarde mensuelle le 1er du mois à ${BACKUP_TIME}"
        ;;
    *)
        echo "❌ Fréquence non reconnue: ${FREQUENCY}"
        echo "Options disponibles: daily, weekly, monthly"
        exit 1
        ;;
esac

# Ajouter la tâche cron
(crontab -l 2>/dev/null; echo "${CRON_SCHEDULE} ${CRON_SCRIPT}") | crontab -

echo "✅ Tâche cron configurée avec succès!"
echo "📋 Tâches cron actuelles:"
crontab -l

echo ""
echo "📝 Informations importantes:"
echo "   - Les sauvegardes seront stockées dans: ${PROJECT_DIR}/backups/"
echo "   - Les logs seront écrits dans: ${PROJECT_DIR}/backup.log"
echo "   - Pour tester manuellement: ${CRON_SCRIPT}"
echo "   - Pour supprimer la tâche cron: crontab -e" 