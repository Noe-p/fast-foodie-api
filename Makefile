# Makefile pour Fast Foodie API
# Inclut les commandes de sauvegarde et de déploiement

.PHONY: help build up down logs backup restore list-backups setup-backup deploy docker.build docker.tag docker.push

# Variables
COMPOSE_FILE = docker-compose.yml
PROJECT_DIR = ~/fast-foodie

# Aide
help:
	@echo "🚀 Fast Foodie API - Commandes disponibles:"
	@echo ""
	@echo "📦 Développement Local:"
	@echo "  make build     - Construire les images Docker"
	@echo "  make up        - Démarrer les services"
	@echo "  make down      - Arrêter les services"
	@echo "  make logs      - Afficher les logs"
	@echo ""
	@echo "🚀 Déploiement:"
	@echo "  make deploy    - Build, push et déployer avec Ansible"
	@echo ""
	@echo "💾 Sauvegardes:"
	@echo "  make backup    - Créer une sauvegarde manuelle"
	@echo "  make restore   - Restaurer une sauvegarde (usage: make restore FILE=backup.sql)"
	@echo "  make list-backups - Lister les sauvegardes"
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

# Sauvegardes
backup:
	@echo "💾 Création d'une sauvegarde manuelle..."
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/backup.sh; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

backup-db:
	@echo "💾 Création d'une sauvegarde DB manuelle..."
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/backup.sh --db; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

backup-images:
	@echo "💾 Création d'une sauvegarde images manuelle..."
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/backup.sh --images; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"; \
		echo "Usage: make restore FILE=backup.sql"; \
		exit 1; \
	fi
	@echo "🔄 Restauration de la sauvegarde: $(FILE)"
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/restore.sh "$(FILE)"; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

list-backups:
	@echo "📋 Liste des sauvegardes disponibles:"
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/list-backups.sh; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

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
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/list-backups.sh info "$(FILE)"; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

backup-delete:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Erreur: Veuillez spécifier un fichier de sauvegarde"; \
		echo "Usage: make backup-delete FILE=backup.sql"; \
		exit 1; \
	fi
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/list-backups.sh delete "$(FILE)"; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

backup-cleanup:
	@echo "🧹 Nettoyage des anciennes sauvegardes..."
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/list-backups.sh cleanup; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

backup-stats:
	@echo "📊 Statistiques des sauvegardes:"
	@if [ -d "$(PROJECT_DIR)" ]; then \
		cd $(PROJECT_DIR) && \
		BACKUP_DIR="$(PROJECT_DIR)/backups" ./scripts/list-backups.sh stats; \
	else \
		echo "❌ Répertoire $(PROJECT_DIR) non trouvé"; \
		exit 1; \
	fi

