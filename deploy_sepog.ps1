<#
=============================================================================
SCRIPT DE DEPLOY AUTOMATIZADO - VM SEPOG (DCCALOR)
Arquivo: deploy_sepog.ps1
Uso: .\deploy_sepog.ps1 -HostVM "IP_OU_HOST_DA_VM" -UserVM "usuario"
=============================================================================
#>
param (
    [string]$HostVM = "10.0.0.1",          # <-- Altere para o IP da VM da SEPOG
    [string]$UserVM = "ubuntu",            # <-- Altere para o usuário SSH da VM
    [string]$RemotePath = "~/dccalor",     # <-- Diretório onde o DCCALOR está na VM
    [string]$PortSSH = "22"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [DCCALOR] INICIANDO DEPLOY AUTOMÁTICO NA VM DA SEPOG" -ForegroundColor Cyan
Write-Host " Host: $UserVM@$HostVM:$PortSSH | Destino: $RemotePath" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Comando a ser executado remotamente na VM
$ComandoRemoto = @"
    set -e
    echo '[1/4] Acessando diretório do projeto na VM...'
    cd $RemotePath || { echo 'Criando pasta e clonando repositório...'; git clone https://github.com/NeudoMaia/dccalor.git $RemotePath; cd $RemotePath; }

    echo '[2/4] Puxando as últimas atualizações do Git...'
    git fetch origin main
    git reset --hard origin/main

    echo '[3/4] Atualizando dependências...'
    pip install -q -r requirements.txt

    echo '[4/4] Executando validação rápida e reiniciando serviço...'
    python -c "import dccalor; print('[✓] Pacote DCCALOR carregado com sucesso na VM!')"

    # Se estiver rodando como serviço systemd ou docker:
    if systemctl is-active --quiet dccalor 2>/dev/null; then
        echo '[*] Reiniciando serviço systemd dccalor...'
        sudo systemctl restart dccalor
    elif [ -f docker-compose.yml ]; then
        echo '[*] Reiniciando container Docker...'
        docker compose restart || docker-compose restart
    fi

    echo '============================================================'
    echo ' [✓] DEPLOY NA VM DA SEPOG CONCLUÍDO COM SUCESSO!'
    echo '============================================================'
"@

# 2. Executar via SSH nativo do Windows
try {
    Write-Host "`n[*] Conectando via SSH e aplicando atualizações..." -ForegroundColor Yellow
    ssh -p $PortSSH -o StrictHostKeyChecking=no "$UserVM@$HostVM" $ComandoRemoto
    Write-Host "`n[✓] Processo de Deploy finalizado!" -ForegroundColor Green
} catch {
    Write-Host "`n[!] Erro durante o deploy na VM: $_" -ForegroundColor Red
}
