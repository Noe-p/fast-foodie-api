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
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup

# Sauvegarde avec nom personnalisé
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/backup-db.sh "ma_sauvegarde"
```

### Restauration

```bash
# Restaurer une sauvegarde
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/restore-db.sh "fast_foodie_backup_20241201_020000.sql"
```

### Gestion des sauvegardes

```bash
# Lister toutes les sauvegardes
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/list-backups.sh

# Afficher les informations d'une sauvegarde
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/list-backups.sh info "fast_foodie_backup_20241201_020000.sql"

# Supprimer une sauvegarde
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/list-backups.sh delete "fast_foodie_backup_20241201_020000.sql"

# Nettoyer les anciennes sauvegardes
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/list-backups.sh cleanup

# Afficher les statistiques
docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup /scripts/list-backups.sh stats
```

## ⏰ Sauvegardes automatiques

### Configuration

Le système de sauvegardes automatiques utilise cron pour exécuter les sauvegardes selon un planning défini.

```bash
# Configuration des sauvegardes quotidiennes à 2h00
./setup-backup-cron.sh daily 02:00

# Configuration des sauvegardes hebdomadaires le dimanche à 2h00
./setup-backup-cron.sh weekly 02:00

# Configuration des sauvegardes mensuelles le 1er du mois à 2h00
./setup-backup-cron.sh monthly 02:00
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

Les sauvegardes sont stockées dans le volume Docker `backups` :

- **Dans le container** : `/backups/`
- **Sur l'hôte** : Volume Docker géré par Docker

### Rétention

- **Par défaut** : 7 sauvegardes conservées
- **Nettoyage automatique** : Les plus anciennes sont supprimées
- **Configuration** : Modifiable dans `backup-db.sh` (variable `MAX_BACKUPS`)

## 🔧 Configuration

### Variables d'environnement

Les scripts utilisent les variables d'environnement suivantes :

```bash
DB_HOST=fast-foodie-db          # Hôte de la base de données
DB_PORT=5432                    # Port PostgreSQL
DB_NAME=fast_foodie             # Nom de la base de données
DB_USER=postgres                # Utilisateur PostgreSQL
DB_PASSWORD=your_password       # Mot de passe PostgreSQL
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
   - Vérifier les variables d'environnement

2. **Espace disque insuffisant**

   - Nettoyer les anciennes sauvegardes : `./list-backups.sh cleanup`
   - Vérifier l'espace disponible sur le volume Docker

3. **Permissions insuffisantes**
   - Vérifier les permissions du répertoire de sauvegarde
   - S'assurer que l'utilisateur PostgreSQL a les droits nécessaires

### Logs de débogage

Pour activer les logs détaillés, ajouter `--verbose` aux commandes pg_dump :

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
2. Tester manuellement : `docker-compose -f docker-compose.api.yml run --rm fast-foodie-backup`
3. Vérifier l'espace disque : `df -h`
4. Vérifier les containers : `docker-compose -f docker-compose.api.yml ps`
