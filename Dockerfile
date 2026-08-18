# Stage 1: Build the frontend SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte e gerar build de produção do frontend (dist)
COPY . .
RUN npm run build

# Stage 2: Produção com Node.js e Express
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copiar artefatos do build e arquivos necessários para a API
COPY --from=builder /app/dist ./dist
COPY api ./api
COPY server.ts ./server.ts
COPY tsconfig.json ./tsconfig.json

# Expor a porta da aplicação
EXPOSE 3000

# Comando para iniciar o servidor de produção
CMD ["tsx", "server.ts"]
