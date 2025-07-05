# Stage de construction
FROM node:18.17.0-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY ormconfig.ts ./

# Installer toutes les dépendances (incluant dev pour la construction)
RUN npm install

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
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/nest-cli.json ./
COPY --from=builder /app/ormconfig.ts ./

# Installer les dépendances de production + celles nécessaires aux migrations
RUN npm install --omit=dev && \
    npm install ts-node tsconfig-paths @types/node

# Créer les répertoires nécessaires
RUN mkdir -p /app/public/files /app/public

# Créer un fichier index.html simple pour éviter les erreurs
RUN echo '<!DOCTYPE html><html><head><title>Fast Foodie API</title></head><body><h1>Fast Foodie API</h1><p>API is running successfully!</p></body></html>' > /app/public/index.html

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
