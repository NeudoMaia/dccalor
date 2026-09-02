param (
    [string]$HostVM = "172.31.3.60",
    [string]$UserVM = "root",
    [string]$RemotePath = "/root/dccalor",
    [string]$PortSSH = "22"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [DCCALOR] INICIANDO DEPLOY NA VM SEPOG ($UserVM@$HostVM)" -ForegroundColor Cyan
Write-Host " Diretorio Remoto: $RemotePath" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$ComandoRemoto = "cd $RemotePath && git fetch origin main && git reset --hard origin/main && bash deploy.sh"

try {
    Write-Host ""
    Write-Host "[*] Conectando via SSH em $UserVM@$HostVM..." -ForegroundColor Yellow
    ssh -p $PortSSH -o StrictHostKeyChecking=no "$UserVM@$HostVM" $ComandoRemoto
    Write-Host ""
    Write-Host "[OK] Processo de Deploy finalizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[ERRO] Falha durante o deploy: $_" -ForegroundColor Red
}