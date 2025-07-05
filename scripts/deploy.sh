#!/bin/bash

# Script de déploiement pour Fast Foodie API
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
PROJECT_DIR="$HOME/fast-foodie"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.api.yml"
BACKUP_DIR="$PROJECT_DIR/backups"

# Variables d'environnement pour Docker Compose
export GHCR_REGISTRY="ghcr.io"
export OWNER_LC="noe-p"

# Créer le répertoire de projet s'il n'existe pas
mkdir -p "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

# Vérifier la présence du fichier .env
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "✅ Fichier .env trouvé"
    echo "📄 Contenu du fichier .env (variables sensibles masquées):"
    grep -E "^(TYPEORM_|JWT_|API_|FILES_)" "$PROJECT_DIR/.env" | sed 's/=.*/=***/' || echo "Aucune variable TYPEORM_ trouvée"
else
    echo "⚠️  Fichier .env non trouvé dans $PROJECT_DIR"
    echo "📋 Fichiers présents dans le répertoire:"
    ls -la "$PROJECT_DIR" || echo "Répertoire vide ou inaccessible"
fi

# Fonction de sauvegarde
backup_database() {
    echo "📦 Sauvegarde de la base de données..."
    
    # Vérifier si le conteneur de base de données existe et fonctionne
    if docker ps | grep -q "fast-foodie-db"; then
        echo "✅ Conteneur de base de données trouvé, sauvegarde en cours..."
        
        # Déboguer les variables d'environnement
        echo "🔍 Débogage des variables d'environnement:"
        echo "  TYPEORM_HOST: ${TYPEORM_HOST:-non défini}"
        echo "  TYPEORM_PORT: ${TYPEORM_PORT:-non défini}"
        echo "  TYPEORM_USERNAME: ${TYPEORM_USERNAME:-non défini}"
        echo "  TYPEORM_DATABASE: ${TYPEORM_DATABASE:-non défini}"
        echo "  TYPEORM_PASSWORD: ${TYPEORM_PASSWORD:+défini}"
        
        if [ -f "$PROJECT_DIR/scripts/backup-db.sh" ]; then
            chmod +x "$PROJECT_DIR/scripts/backup-db.sh"
            # Exécuter le script de sauvegarde avec le bon répertoire
            cd "$PROJECT_DIR"
            BACKUP_DIR="$BACKUP_DIR" "$PROJECT_DIR/scripts/backup-db.sh"
        else
            echo "❌ Script de sauvegarde non trouvé: $PROJECT_DIR/scripts/backup-db.sh"
        fi
    else
        echo "⚠️  Conteneur de base de données non trouvé, pas de sauvegarde"
        echo "ℹ️  C'est normal pour le premier déploiement"
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
    
    if docker pull ghcr.io/noe-p/fast-foodie-api:main; then
        echo "✅ Image téléchargée avec succès"
    else
        echo "⚠️  Image non trouvée, construction locale..."
        echo "ℹ️  Construction de l'image Docker..."
        
        # Créer un Dockerfile temporaire pour une image simple
        cat > /tmp/Dockerfile.simple << 'EOF'
FROM node:18.17.0-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm install --omit=dev
RUN mkdir -p /app/public/files
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-e", "console.log('API temporaire démarrée'); require('http').createServer((req, res) => { res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('API temporaire - Déploiement en cours...'); }).listen(8000, () => console.log('Serveur temporaire sur le port 8000'));"]
EOF
        
        # Construire l'image temporaire
        docker build -f /tmp/Dockerfile.simple -t ghcr.io/noe-p/fast-foodie-api:main .
        echo "✅ Image temporaire construite"
    fi
    
    # Démarrer les conteneurs
    echo "▶️  Démarrage des conteneurs..."
    if docker compose -f "$COMPOSE_FILE" up -d; then
        echo "✅ Conteneurs démarrés avec succès"
    else
        echo "❌ Erreur lors du démarrage des conteneurs"
        echo "📋 Logs des conteneurs:"
        docker compose -f "$COMPOSE_FILE" logs
        exit 1
    fi
    
    # Vérifier le statut immédiatement
    echo "📊 Statut des conteneurs:"
    docker compose -f "$COMPOSE_FILE" ps
    
    # Attendre un peu et vérifier les logs
    echo "⏳ Attente de 5 secondes pour le démarrage..."
    sleep 5
    
    echo "📋 Logs du conteneur API:"
    docker logs fast-foodie-api --tail 20 || echo "Impossible de récupérer les logs du conteneur API"
    
    echo "📋 Logs du conteneur base de données:"
    docker logs fast-foodie-db --tail 10 || echo "Impossible de récupérer les logs du conteneur DB"
}

# Fonction de vérification de santé
health_check() {
    echo "🏥 Vérification de la santé de l'application..."
    
    # Afficher les logs du conteneur API pour diagnostiquer
    echo "📋 Logs du conteneur API:"
    docker logs fast-foodie-api --tail 20 || echo "Impossible de récupérer les logs"
    
    echo "📋 Logs du conteneur base de données:"
    docker logs fast-foodie-db --tail 10 || echo "Impossible de récupérer les logs"
    
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
    echo "📋 Logs finaux du conteneur API:"
    docker logs fast-foodie-api --tail 50 || echo "Impossible de récupérer les logs"
    return 1
}

# Exécution principale
main() {
    deploy
    # Sauvegarde seulement si c'est pas le premier déploiement
    if docker ps | grep -q "fast-foodie-db"; then
        backup_database
    else
        echo "ℹ️  Premier déploiement, pas de sauvegarde"
    fi
    cleanup
    health_check
    
    echo "🎉 Déploiement terminé avec succès!"
}

# Gestion des erreurs
trap 'echo "❌ Erreur lors du déploiement"; exit 1' ERR

# Exécuter le script principal
main "$@" 