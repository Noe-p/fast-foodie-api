# Makefile pour Fast Foodie API
# Inclut les commandes de sauvegarde et de déploiement

.PHONY: help build up down logs backup restore list-backups setup-backup deploy docker.build docker.tag docker.push

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = docker-compose.api.yml
BACKUP_SERVICE = fast-foodie-backup

# Aide
help:
	@echo "🚀 Fast Foodie API - Commandes disponibles:"
	@echo ""
	@echo "📦 Développement Local (docker-compose.yml):"
	@echo "  make build     - Construire les images Docker"
	@echo "  make up        - Démarrer les services"
	@echo "  make down      - Arrêter les services"
	@echo "  make logs      - Afficher les logs"
	@echo ""
	@echo "📦 Production (docker-compose.api.yml):"
	@echo "  make prod-up   - Démarrer les services en production"
	@echo "  make prod-down - Arrêter les services en production"
	@echo "  make deploy    - Build, push et déployer avec Ansible"
	@echo ""
	@echo "💾 Sauvegardes Local:"
	@echo "  make backup    - Créer une sauvegarde manuelle"
	@echo "  make restore   - Restaurer une sauvegarde (usage: make restore FILE=backup.sql)"
	@echo "  make list-backups - Lister les sauvegardes"
	@echo ""
	@echo "💾 Sauvegardes Production:"
	@echo "  make prod-backup - Créer une sauvegarde en production"
	@echo "  make prod-list-backups - Lister les sauvegardes en production"
	@echo ""
	@echo "⚙️  Configuration:"
	@echo "  make setup-backup - Configurer les sauvegardes automatiques"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  make clean     - Nettoyer les containers et images"
	@echo "  make prune     - Nettoyer les volumes non utilisés"

# Déploiement
build:
	docker-compose -f $(COMPOSE_FILE) build

docker.build:
	docker build --platform=linux/amd64 -t fast-foodie-api:latest .

docker.tag:
	docker tag fast-foodie-api:latest noephilippe/fast-foodie-api:latest

docker.push:
	docker push noephilippe/fast-foodie-api:latest

deploy:
	make docker.build
	make docker.tag
	make docker.push
	ansible-playbook -i inventory.ini deploy.yml

up:
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Production
prod-up:
	docker-compose -f $(COMPOSE_PROD_FILE) up -d

prod-down:
	docker-compose -f $(COMPOSE_PROD_FILE) down

prod-backup:
	@echo "💾 Création d'une sauvegarde en production..."
	docker-compose -f $(COMPOSE_PROD_FILE) run --rm $(BACKUP_SERVICE)

prod-list-backups:
	@echo "📋 Liste des sauvegardes en production:"
	docker-compose -f $(COMPOSE_PROD_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh

# Sauvegardes
backup:
	@echo "💾 Création d'une sauvegarde manuelle..."
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE)

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"; \
		echo "Usage: make restore FILE=backup.sql"; \
		exit 1; \
	fi
	@echo "🔄 Restauration de la sauvegarde: $(FILE)"
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/restore-db.sh "$(FILE)"

list-backups:
	@echo "📋 Liste des sauvegardes disponibles:"
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh

setup-backup:
	@echo "⏰ Configuration des sauvegardes automatiques..."
	@read -p "Fréquence (daily/weekly/monthly) [daily]: " frequency; \
	frequency=$${frequency:-daily}; \
	read -p "Heure (HH:MM) [02:00]: " time; \
	time=$${time:-02:00}; \
	./scripts/setup-backup-cron.sh $$frequency $$time

# Maintenance
clean:
	@echo "🧹 Nettoyage des containers et images..."
	docker-compose -f $(COMPOSE_FILE) down --remove-orphans
	docker system prune -f

prune:
	@echo "🗑️  Nettoyage des volumes non utilisés..."
	docker volume prune -f

# Commandes de développement
dev:
	docker-compose -f $(COMPOSE_FILE) up

dev-build:
	docker-compose -f $(COMPOSE_FILE) up --build

# Commandes de base de données
db-shell:
	docker-compose -f $(COMPOSE_FILE) exec fast-foodie-db psql -U postgres -d fast_foodie

db-logs:
	docker-compose -f $(COMPOSE_FILE) logs -f fast-foodie-db

# Commandes d'API
api-logs:
	docker-compose -f $(COMPOSE_FILE) logs -f fast-foodie-api

api-shell:
	docker-compose -f $(COMPOSE_FILE) exec fast-foodie-api sh

# Commandes de monitoring
status:
	@echo "📊 État des services:"
	docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "💾 Espace disque:"
	docker system df
	@echo ""
	@echo "📈 Utilisation des volumes:"
	docker volume ls --format "table {{.Name}}\t{{.Size}}"

# Commandes de sauvegarde avancées
backup-info:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"; \
		echo "Usage: make backup-info FILE=backup.sql"; \
		exit 1; \
	fi
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh info "$(FILE)"

backup-delete:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"; \
		echo "Usage: make backup-delete FILE=backup.sql"; \
		exit 1; \
	fi
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh delete "$(FILE)"

backup-cleanup:
	@echo "🧹 Nettoyage des anciennes sauvegardes..."
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh cleanup

backup-stats:
	@echo "📊 Statistiques des sauvegardes:"
	docker-compose -f $(COMPOSE_FILE) run --rm $(BACKUP_SERVICE) /scripts/list-backups.sh stats