#!/bin/bash
# ==========================================================
# Script de Deploy / Atualização Automática - DCCALOR (VM SEPOG)
# ==========================================================

set -e

echo "===================================================="
echo "   Iniciando Deploy do Sistema DCCALOR na VM SEPOG  "
echo "===================================================="

# 1. Atualizar repositório Git
echo "[1/4] Atualizando código com Git..."
git pull origin main

# 2. Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "[AVISO] Arquivo .env não encontrado. Copiando de .env.example..."
    cp .env.example .env
    echo "[IMPORTANTE] Por favor, configure suas credenciais no arquivo .env antes de prosseguir!"
fi

# 3. Escolha do método de execução (Docker ou PM2/Nginx)
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "[2/4] Docker detectado. Construindo e subindo containers..."
    docker compose down || true
    docker compose build --no-cache
    docker compose up -d
    echo "[3/4] Aguardando inicialização..."
    sleep 5
    echo "[4/4] Verificando status da aplicação..."
    docker compose ps
    echo "DCCALOR rodando com sucesso via Docker!"
else
    echo "[2/4] Modo nativo Node.js/PM2..."
    npm install
    npm run build
    
    if command -v pm2 &> /dev/null; then
        echo "[3/4] Reiniciando aplicação no PM2..."
        pm2 restart dccalor || pm2 start "npm run start" --name dccalor
        pm2 save
    else
        echo "[3/4] PM2 não detectado. Iniciando com npm start..."
        npm run start &
    fi
    echo "[4/4] Deploy concluído!"
fi

echo "===================================================="
echo "   Deploy Concluído com Sucesso!                    "
echo "   Endpoint: http://localhost:3000                  "
echo "   Healthcheck: http://localhost:3000/api/health    "
echo "===================================================="
