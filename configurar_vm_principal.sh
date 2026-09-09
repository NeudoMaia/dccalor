#!/bin/bash
# ==========================================================
# Script de Configuração da VM SEPOG (172.31.3.60)
# Define DCCALOR como Sistema Principal e Preserva DCPET
# ==========================================================

set -e

echo "===================================================="
echo " [DCCALOR] Configurando Sistema Principal na VM     "
echo "===================================================="

# 1. Backup do Nginx
BACKUP_DIR="/etc/nginx/backup_$(date +%Y%m%d_%H%M%S)"
echo "[1/6] Criando backup do Nginx em $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/sites-available "$BACKUP_DIR/" 2>/dev/null || true
cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/" 2>/dev/null || true
cp -r /etc/nginx/conf.d "$BACKUP_DIR/" 2>/dev/null || true

# 2. Descobrir a porta exata usada pelo DCPET atualmente
echo "[2/6] Identificando configuração atual do DCPET..."
DCPET_LINE=$(grep -rn "location.*dcpet" /etc/nginx/ 2>/dev/null | head -n 1 || true)
DCPET_TARGET="http://127.0.0.1:3001/"

if [ -n "$DCPET_LINE" ]; then
    DCPET_FILE=$(echo "$DCPET_LINE" | cut -d: -f1)
    DETECTED_TARGET=$(grep -A 5 "location.*dcpet" "$DCPET_FILE" | grep -oP 'proxy_pass\s+\K[^;]+' | head -n 1 || true)
    if [ -n "$DETECTED_TARGET" ]; then
        DCPET_TARGET="$DETECTED_TARGET"
        echo " -> Alvo do DCPET detectado: $DCPET_TARGET"
    fi
fi

# 3. Gerar a nova configuração do Nginx
echo "[3/6] Aplicando nova configuração unificada no Nginx..."
cat << 'EOF' > /etc/nginx/sites-available/dccalor
# Configuração Unificada: DCCALOR (Principal) + DCPET (Subsistema)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/dccalor_access.log;
    error_log /var/log/nginx/dccalor_error.log;

    client_max_body_size 20M;

    # Suporte para quem digitar /dccalor no navegador -> Redireciona para /
    location = /dccalor {
        return 301 /;
    }
    location /dccalor/ {
        return 301 /;
    }

    # Redirecionamento de barra para o DCPET
    location = /dcpet {
        return 301 /dcpet/;
    }

    # Subsistema DCPET (Saúde Animal)
    location /dcpet/ {
        proxy_pass DCPET_PROXY_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Sistema Principal: DCCALOR (na raiz /)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
}
EOF

# Substituir o placeholder do DCPET
sed -i "s|DCPET_PROXY_PLACEHOLDER|$DCPET_TARGET|g" /etc/nginx/sites-available/dccalor

# 4. Desativar sites anteriores da porta 80 e ativar dccalor
echo "[4/6] Desativando site antigo (RDC) e ativando DCCALOR..."
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/dccalor /etc/nginx/sites-enabled/dccalor

# Testar configuração do Nginx
nginx -t
systemctl reload nginx
echo " -> Nginx recarregado com sucesso!"

# 5. Desativar container do RDC se estiver rodando
echo "[5/6] Verificando containers Docker..."
if command -v docker &> /dev/null; then
    RDC_CONTAINERS=$(docker ps --format '{{.Names}}' | grep -iE 'rdc|percepcao' || true)
    if [ -n "$RDC_CONTAINERS" ]; then
        echo " -> Parando container(s) do RDC: $RDC_CONTAINERS"
        docker stop $RDC_CONTAINERS || true
    fi
fi

# 6. Atualizar e subir DCCALOR
echo "[6/6] Garantindo que o DCCALOR está em execução..."
if [ -f docker-compose.yml ]; then
    docker compose up -d
fi

echo "===================================================="
echo " [OK] Transição concluída com sucesso!             "
echo " DCCALOR acessível em: http://172.31.3.60           "
echo " DCPET acessível em:   http://172.31.3.60/dcpet/    "
echo "===================================================="
