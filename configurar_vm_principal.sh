#!/bin/bash
set -e

echo "===================================================="
echo " [DCCALOR] Configurando Sistema Principal na VM     "
echo "===================================================="

# 1. Backup de seguranca do Nginx
BACKUP_DIR="/etc/nginx/backup_$(date +%Y%m%d_%H%M%S)"
echo "[1/5] Criando backup de seguranca em $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/conf.d "$BACKUP_DIR/" 2>/dev/null || true
cp -r /etc/nginx/sites-available "$BACKUP_DIR/" 2>/dev/null || true
cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/" 2>/dev/null || true
cp /etc/nginx/nginx.conf "$BACKUP_DIR/" 2>/dev/null || true

# 2. Descobrir alvo do DCPET
echo "[2/5] Detectando configuracao atual do DCPET..."
DCPET_TARGET=$(grep -rh -A 5 "location.*dcpet" /etc/nginx/ 2>/dev/null | grep -oP 'proxy_pass\s+\K[^;]+' | head -n 1 || true)
if [ -n "$DCPET_TARGET" ]; then
    echo " -> Proxy DCPET detectado: $DCPET_TARGET"
else
    DCPET_TARGET="http://127.0.0.1:3001/"
    echo " -> Usando porta padrao para DCPET: $DCPET_TARGET"
fi

# 3. Desativar configuracoes antigas do RDC / Default
echo "[3/5] Desativando site antigo (RDC)..."
# Desativa no conf.d
if [ -d /etc/nginx/conf.d ]; then
    for f in /etc/nginx/conf.d/*.conf; do
        if [ -f "$f" ]; then
            # Se contiver a raiz antiga ou RDC, desativa renomeando
            if grep -qE "percepcao|rdc|root /" "$f" 2>/dev/null || [ "$(basename "$f")" = "default.conf" ]; then
                echo " -> Desativando $f..."
                mv "$f" "${f}.disabled"
            fi
        fi
    done
fi

# Desativa no sites-enabled se existir
if [ -d /etc/nginx/sites-enabled ]; then
    rm -f /etc/nginx/sites-enabled/* 2>/dev/null || true
fi

# 4. Escrever a nova configuracao
echo "[4/5] Gerando configuracao unificada..."
mkdir -p /etc/nginx/conf.d
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

CONF_CONTENT="server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/dccalor_access.log;
    error_log /var/log/nginx/dccalor_error.log;

    client_max_body_size 20M;

    location = /dccalor {
        return 301 /;
    }
    location /dccalor/ {
        return 301 /;
    }

    location = /dcpet {
        return 301 /dcpet/;
    }

    location /dcpet/ {
        proxy_pass $DCPET_TARGET;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
}"

# Grava tanto no conf.d quanto no sites-available para garantir compatibilidade com qualquer distro
echo "$CONF_CONTENT" > /etc/nginx/conf.d/dccalor.conf
echo "$CONF_CONTENT" > /etc/nginx/sites-available/dccalor
ln -sf /etc/nginx/sites-available/dccalor /etc/nginx/sites-enabled/dccalor 2>/dev/null || true

# 5. Testar e recarregar Nginx
echo "[5/5] Testando e recarregando o Nginx..."
if nginx -t; then
    systemctl reload nginx || nginx -s reload
    echo "===================================================="
    echo " [SUCESSO] Nginx configurado e ativo!              "
    echo " DCCALOR acessivel em: http://172.31.3.60           "
    echo " DCPET acessivel em:   http://172.31.3.60/dcpet/    "
    echo "===================================================="
else
    echo "ERRO: O teste do Nginx falhou. Restaurando backup..."
    cp -r "$BACKUP_DIR"/* /etc/nginx/
    systemctl reload nginx || true
    exit 1
fi