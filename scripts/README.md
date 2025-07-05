# 🔄 Système de Sauvegarde Fast Foodie

Ce dossier contient tous les scripts nécessaires pour gérer les sauvegardes automatiques de la base de données PostgreSQL de Fast Foodie.

## 📁 Fichiers inclus

- `backup-db.sh` - Script principal de sauvegarde
- `restore-db.sh` - Script de restauration
- `list-backups.sh` - Gestionnaire de sauvegardes
- `setup-backup-cron.sh` - Configuration des sauvegardes automatiques

## 🚀 Utilisation

### Sauvegarde manuelle

```bash
# Sauvegarde avec nom par défaut (timestamp automatique)
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/backup-db.sh

# Sauvegarde avec nom personnalisé
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/backup-db.sh "ma_sauvegarde"
```

### Restauration

```bash
# Restaurer une sauvegarde
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/restore-db.sh "fast_foodie_backup_20241201_020000.sql"
```

### Gestion des sauvegardes

```bash
# Lister toutes les sauvegardes
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh

# Afficher les informations d'une sauvegarde
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh info "fast_foodie_backup_20241201_020000.sql"

# Supprimer une sauvegarde
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh delete "fast_foodie_backup_20241201_020000.sql"

# Nettoyer les anciennes sauvegardes
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh cleanup

# Afficher les statistiques
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh stats
```

## ⏰ Sauvegardes automatiques

### Configuration

Le système de sauvegardes automatiques utilise cron pour exécuter les sauvegardes selon un planning défini.

```bash
# Configuration des sauvegardes quotidiennes à 2h00
./scripts/setup-backup-cron.sh daily 02:00

# Configuration des sauvegardes hebdomadaires le dimanche à 2h00
./scripts/setup-backup-cron.sh weekly 02:00

# Configuration des sauvegardes mensuelles le 1er du mois à 2h00
./scripts/setup-backup-cron.sh monthly 02:00
```

### Fréquences disponibles

- `daily` - Quotidienne (tous les jours)
- `weekly` - Hebdomadaire (tous les dimanches)
- `monthly` - Mensuelle (1er du mois)

### Logs

Les logs des sauvegardes automatiques sont stockés dans :

```
/home/noep/fast-foodie/backup.log
```

## 📊 Stockage

### Localisation des sauvegardes

Les sauvegardes sont stockées dans le répertoire local :

- **Répertoire** : `/home/noep/fast-foodie/backups/`
- **Format** : Fichiers `.sql` avec timestamp

### Rétention

- **Par défaut** : 7 sauvegardes conservées
- **Nettoyage automatique** : Les plus anciennes sont supprimées
- **Configuration** : Modifiable dans `backup-db.sh` (variable `MAX_BACKUPS`)

## 🔧 Configuration

### Variables d'environnement

Les scripts utilisent les variables d'environnement du fichier `.env` :

```bash
TYPEORM_HOST=localhost          # Hôte de la base de données
TYPEORM_PORT=5432              # Port PostgreSQL
TYPEORM_DATABASE=fast_foodie   # Nom de la base de données
TYPEORM_USERNAME=postgres      # Utilisateur PostgreSQL
TYPEORM_PASSWORD=your_password # Mot de passe PostgreSQL
```

### Personnalisation

Pour modifier la configuration :

1. **Nombre de sauvegardes conservées** : Modifier `MAX_BACKUPS` dans `backup-db.sh`
2. **Répertoire de sauvegarde** : Modifier `BACKUP_DIR` dans les scripts
3. **Format des noms de fichiers** : Modifier la variable `BACKUP_NAME` dans `backup-db.sh`

## 🛡️ Sécurité

### Sauvegarde de sécurité

Lors d'une restauration, le script `restore-db.sh` crée automatiquement une sauvegarde de sécurité avant d'écraser la base de données actuelle.

### Vérifications

- Vérification de l'existence des fichiers avant restauration
- Confirmation utilisateur pour les opérations destructives
- Gestion des erreurs avec messages informatifs

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**

   - Vérifier que le container `fast-foodie-db` est démarré
   - Vérifier les variables d'environnement dans le fichier `.env`

2. **Espace disque insuffisant**

   - Nettoyer les anciennes sauvegardes : `BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/list-backups.sh cleanup`
   - Vérifier l'espace disponible : `df -h`

3. **Permissions insuffisantes**
   - Vérifier les permissions du répertoire de sauvegarde
   - S'assurer que l'utilisateur a les droits nécessaires

### Logs de débogage

Pour activer les logs détaillés, ajouter `--verbose` aux commandes pg_dump dans `backup-db.sh` :

```bash
# Dans backup-db.sh, ligne avec pg_dump
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --verbose \  # <-- Cette ligne
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="${BACKUP_FILE}"
```

## 📞 Support

En cas de problème avec le système de sauvegarde :

1. Vérifier les logs : `tail -f /home/noep/fast-foodie/backup.log`
2. Tester manuellement : `BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/backup-db.sh`
3. Vérifier l'espace disque : `df -h`
4. Vérifier les containers : `docker-compose -f docker-compose.api.yml ps`
5. Vérifier les tâches cron : `crontab -l`

## 🖥️ Commandes de production

### Connexion au serveur

```bash
ssh noep@votre-serveur.com
cd /home/noep/fast-foodie
```

### Sauvegarde d'urgence

```bash
# Créer une sauvegarde immédiate
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/backup-db.sh
```

### Restauration d'urgence

```bash
# Arrêter l'application
docker-compose -f docker-compose.api.yml down

# Restaurer la sauvegarde
BACKUP_DIR="/home/noep/fast-foodie/backups" ./scripts/restore-db.sh "backup_2024_01_15_02_00.sql"

# Redémarrer l'application
docker-compose -f docker-compose.api.yml up -d
```

### Vérification

```bash
# Voir les logs de l'application
docker-compose -f docker-compose.api.yml logs -f

# Vérifier l'état des conteneurs
docker-compose -f docker-compose.api.yml ps
```
