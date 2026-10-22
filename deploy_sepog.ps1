param (
    [string]$HostVM = "172.31.3.60",
    [string]$UserVM = "root",
    [string]$RemotePath = "/root/dccalor",
    [string]$PortSSH = "22"
)

$EnvFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $EnvFile) -or -not (Select-String -Path $EnvFile -Pattern "^VM_SSH_PASSWORD=" -Quiet)) {
    $SecPass = Read-Host "Digite a senha SSH para $UserVM@$HostVM (digitacao oculta - sera salva em .env para futuros deploys)" -AsSecureString
    $PlainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecPass))
    Add-Content -Path $EnvFile -Value "`n# Credenciais de Deploy Automatizado VM SEPOG`nVM_SSH_HOST=`"$HostVM`"`nVM_SSH_USER=`"$UserVM`"`nVM_REMOTE_PATH=`"$RemotePath`"`nVM_SSH_PASSWORD=`"$PlainPass`""
    Write-Host "[OK] Credenciais salvas com seguranca em .env (ignorado pelo Git)." -ForegroundColor Green
}

python -X utf8 "$PSScriptRoot\deploy_sepog.py" --host $HostVM --user $UserVM --path $RemotePath --port $PortSSH
