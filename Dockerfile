# Stage de construction
FROM node:18.17.0-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY ormconfig.ts ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY src/ ./src/

# Construire l'application
RUN npm run build

# Stage de production
FROM node:18.17.0-alpine AS production
WORKDIR /app

# Installer les dépendances de production
RUN apk add --no-cache dumb-init

# Copier les fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ormconfig.ts ./

# Créer le répertoire pour les fichiers uploadés
RUN mkdir -p /app/public/files

# Installer sharp pour l'optimisation d'images
RUN npm install sharp

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
