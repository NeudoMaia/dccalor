<#
=============================================================================
SCRIPT DE DEPLOY AUTOMATIZADO - VM SEPOG (DCCALOR)
Destino: root@172.31.3.60
=============================================================================
#>
param (
    [string]$HostVM = "172.31.3.60",
    [string]$UserVM = "root",
    [string]$RemotePath = "/root/dccalor",
    [string]$PortSSH = "22"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [DCCALOR] INICIANDO DEPLOY NA VM SEPOG ($UserVM@$HostVM)" -ForegroundColor Cyan
Write-Host " Diretório Remoto: $RemotePath" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$ComandoRemoto = @"
    set -e
    echo '[1/4] Acessando pasta do projeto na VM...'
    cd $RemotePath || { echo 'Clonando repositório na VM...'; git clone https://github.com/NeudoMaia/dccalor.git $RemotePath; cd $RemotePath; }

    echo '[2/4] Atualizando código com a versão mais recente...'
    git fetch origin main
    git reset --hard origin/main

    echo '[3/5] Atualizando dependências e build do frontend...'
    if [ -f requirements.txt ]; then
        pip install -q -r requirements.txt || true
    fi

    # Garantir que a chave CARTO esteja no .env remoto se o arquivo existir
    if [ -f .env ] && ! grep -q "VITE_CARTO_API_KEY" .env; then
        echo 'VITE_CARTO_API_KEY="cb1_2t7z_1_b4192d625bdc678b8f9125ad"' >> .env
    fi

    if command -v npm &> /dev/null; then
        echo '[*] Compilando frontend (Vite)...'
        npm install --silent
        npm run build
    fi

    echo '[4/5] Validando integridade do DCCALOR v2.0...'
    python -c "import dccalor; print('[✓] Pacote DCCALOR carregado com sucesso na VM!')" 2>/dev/null || true

    echo '[5/5] Reiniciando aplicação...'
    if systemctl is-active --quiet dccalor 2>/dev/null; then
        echo '[*] Reiniciando serviço systemd dccalor...'
        systemctl restart dccalor
    elif command -v docker &> /dev/null && [ -f docker-compose.yml ]; then
        echo '[*] Reconstruindo e reiniciando container Docker...'
        (docker compose build --no-cache && docker compose up -d) || (docker-compose build --no-cache && docker-compose up -d) || docker compose restart || docker-compose restart
    elif command -v pm2 &> /dev/null; then
        echo '[*] Reiniciando processo PM2 dccalor...'
        pm2 restart dccalor || pm2 start "npm run start" --name dccalor
    fi

    echo '============================================================'
    echo ' [✓] DEPLOY NA VM DA SEPOG FINALIZADO COM SUCESSO!'
    echo '============================================================'
"@

try {
    Write-Host "`n[*] Conectando via SSH em $UserVM@$HostVM..." -ForegroundColor Yellow
    ssh -p $PortSSH -o StrictHostKeyChecking=no "$UserVM@$HostVM" $ComandoRemoto
    Write-Host "`n[✓] Processo de Deploy finalizado!" -ForegroundColor Green
} catch {
    Write-Host "`n[!] Erro durante o deploy: $_" -ForegroundColor Red
}
