# 🔄 Scripts de Sauvegarde Fast Foodie

Scripts pour gérer les sauvegardes de la base de données et des images en production.

## 📁 Scripts disponibles

- `backup-db.sh` - Sauvegarde de la base de données
- `restore-db.sh` - Restauration de la base de données
- `list-backups.sh` - Gestion des sauvegardes DB
- `backup-images.sh` - Sauvegarde des images
- `restore-images.sh` - Restauration des images
- `list-image-backups.sh` - Gestion des sauvegardes d'images
- `setup-backup-cron.sh` - Configuration des sauvegardes automatiques

## 🚀 Commandes de production

### 📋 Lister les sauvegardes

```bash
# Base de données
BACKUP_DIR="../backups" ./list-backups.sh

# Images
./list-image-backups.sh list
```

### 💾 Créer une sauvegarde

```bash
# Base de données
BACKUP_DIR="../backups" ./backup-db.sh

# Images
./backup-images.sh
```

### 🔄 Restaurer une sauvegarde

```bash
# Base de données
BACKUP_DIR="../backups" ./restore-db.sh "backup_2024_01_15_02_00.sql"

# Images
./restore-images.sh "images_backup_20240115_020000.tar.gz"
```

### 🧹 Nettoyer les anciennes sauvegardes

```bash
# Base de données (garde 7 sauvegardes)
BACKUP_DIR="../backups" ./list-backups.sh cleanup

# Images (garde 3 sauvegardes)
./list-image-backups.sh cleanup
```

### ⏰ Configurer les sauvegardes automatiques

```bash
# Quotidienne à 2h00
./setup-backup-cron.sh daily 02:00

# Hebdomadaire le dimanche à 2h00
./setup-backup-cron.sh weekly 02:00

# Mensuelle le 1er du mois à 2h00
./setup-backup-cron.sh monthly 02:00
```

## 📊 Vérifications

### 📋 Voir les tâches cron

```bash
crontab -l | grep fast-foodie
```

### 📝 Voir les logs

```bash
tail -f /home/noep/fast-foodie/backup.log
```

### 💾 Vérifier l'espace disque

```bash
df -h
du -sh /home/noep/fast-foodie/backups/
```

## 🚨 Procédure d'urgence

### 🔄 Restauration complète

```bash
# 1. Arrêter l'application
docker-compose -f docker-compose.api.yml down

# 2. Restaurer la base de données
BACKUP_DIR="../backups" ./restore-db.sh "backup_2024_01_15_02_00.sql"

# 3. Restaurer les images (optionnel)
./restore-images.sh "images_backup_20240115_020000.tar.gz"

# 4. Redémarrer l'application
docker-compose -f docker-compose.api.yml up -d

# 5. Vérifier
docker-compose -f docker-compose.api.yml logs -f
```

## 📁 Structure des sauvegardes

```
/home/noep/fast-foodie/backups/
├── *.sql                    # Sauvegardes DB (7 max)
└── images/
    └── images_backup_*.tar.gz    # Sauvegardes images (3 max)
```

## ⚙️ Configuration

### 📦 Sauvegardes automatiques

- **Base de données** : Quotidienne à 2h00
- **Images** : Quotidienne à 2h00 (si changements détectés)
- **Rétention** : 7 sauvegardes DB, 3 sauvegardes images

### 🔧 Variables d'environnement

Les scripts utilisent le fichier `.env` pour la connexion à la base de données.

## 🛠️ Dépannage

### ❌ Erreur de connexion DB

```bash
# Vérifier que le conteneur DB est démarré
docker-compose -f docker-compose.api.yml ps

# Vérifier les variables d'environnement
cat .env | grep TYPEORM
```

### 💾 Espace disque insuffisant

```bash
# Nettoyer les anciennes sauvegardes
BACKUP_DIR="../backups" ./list-backups.sh cleanup
./list-image-backups.sh cleanup
```

### ⏰ Cron ne fonctionne pas

```bash
# Reconfigurer les sauvegardes automatiques
./setup-backup-cron.sh daily 02:00

# Vérifier les logs
tail -f /home/noep/fast-foodie/backup.log
```
