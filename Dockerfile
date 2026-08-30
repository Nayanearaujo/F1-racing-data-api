# Etapa 1: Build da Aplicação TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Instala ferramentas de compilação necessárias para better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
COPY data/ ./data/
RUN npm run build

# Etapa 2: Imagem Final Otimizada para Produção
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN apk add --no-cache python3 py3-pip make g++

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/index.js"]
