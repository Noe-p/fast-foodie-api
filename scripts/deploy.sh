#!/bin/bash

# Script de déploiement pour Fast Foodie API
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
PROJECT_DIR="$HOME/fast-foodie"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.api.yml"
BACKUP_DIR="$PROJECT_DIR/backups"

# Créer le répertoire de projet s'il n'existe pas
mkdir -p "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

# Fonction de sauvegarde
backup_database() {
    echo "📦 Sauvegarde de la base de données..."
    if [ -f "$PROJECT_DIR/scripts/backup-db.sh" ]; then
        chmod +x "$PROJECT_DIR/scripts/backup-db.sh"
        "$PROJECT_DIR/scripts/backup-db.sh"
    fi
}

# Fonction de nettoyage
cleanup() {
    echo "🧹 Nettoyage des images Docker..."
    docker image prune -f
    docker system prune -f --volumes
}

# Fonction de déploiement
deploy() {
    echo "🔧 Déploiement de l'application..."
    
    # Arrêter les conteneurs existants
    if [ -f "$COMPOSE_FILE" ]; then
        echo "⏹️  Arrêt des conteneurs existants..."
        docker compose -f "$COMPOSE_FILE" down
    fi
    
    # Pull de la nouvelle image
    echo "⬇️  Téléchargement de la nouvelle image..."
    # Login to ghcr.io if CR_PAT is available
    if [ -n "$CR_PAT" ]; then
        echo "$CR_PAT" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
    fi
    # L'image sera spécifiée dans le docker-compose avec les variables
    docker compose -f "$COMPOSE_FILE" pull
    
    # Démarrer les conteneurs
    echo "▶️  Démarrage des conteneurs..."
    docker compose -f "$COMPOSE_FILE" up -d
    
    # Vérifier le statut
    echo "📊 Statut des conteneurs:"
    docker compose -f "$COMPOSE_FILE" ps
}

# Fonction de vérification de santé
health_check() {
    echo "🏥 Vérification de la santé de l'application..."
    sleep 10
    
    # Attendre que l'API soit prête
    for i in {1..30}; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ L'application est prête!"
            return 0
        fi
        echo "⏳ Attente... ($i/30)"
        sleep 2
    done
    
    echo "❌ L'application n'a pas démarré correctement"
    return 1
}

# Exécution principale
main() {
    backup_database
    deploy
    cleanup
    health_check
    
    echo "🎉 Déploiement terminé avec succès!"
}

# Gestion des erreurs
trap 'echo "❌ Erreur lors du déploiement"; exit 1' ERR

# Exécuter le script principal
main "$@" 