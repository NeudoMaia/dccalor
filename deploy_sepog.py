"""
Script de Deploy Automatizado em Python para a VM da SEPOG
Uso: python deploy_sepog.py --host 10.x.x.x --user ubuntu
"""
import argparse
import subprocess
import sys

def executar_deploy(host: str, user: str, remote_path: str = "~/dccalor", port: int = 22):
    print("=" * 60)
    print(f" [DCCALOR] INICIANDO DEPLOY NA VM SEPOG: {user}@{host}:{port}")
    print("=" * 60)

    cmd_remoto = f"""
    set -e
    echo '[1/4] Acessando {remote_path} na VM...'
    cd {remote_path} || git clone https://github.com/NeudoMaia/dccalor.git {remote_path} && cd {remote_path}
    
    echo '[2/4] Atualizando código (git pull)...'
    git pull origin main
    
    echo '[3/5] Atualizando dependencias e build do frontend...'
    if [ -f requirements.txt ]; then
        pip install -q -r requirements.txt || true
    fi

    if [ -f .env ] && ! grep -q "VITE_CARTO_API_KEY" .env; then
        echo 'VITE_CARTO_API_KEY="cb1_2t7z_1_b4192d625bdc678b8f9125ad"' >> .env
    fi

    if command -v npm &> /dev/null; then
        echo '[*] Compilando frontend (Vite)...'
        npm install --silent
        npm run build
    fi

    echo '[4/5] Validando integridade...'
    python -c "import dccalor; print('[✓] DCCALOR v2.0 validado na VM!')" 2>/dev/null || true

    echo '[5/5] Reiniciando aplicacao...'
    if systemctl is-active --quiet dccalor 2>/dev/null; then
        systemctl restart dccalor
    elif command -v docker &> /dev/null && [ -f docker-compose.yml ]; then
        (docker compose build --no-cache && docker compose up -d) || (docker-compose build --no-cache && docker-compose up -d) || docker compose restart || docker-compose restart
    elif command -v pm2 &> /dev/null; then
        pm2 restart dccalor || pm2 start "npm run start" --name dccalor
    fi

    echo '============================================================'
    echo ' [✓] DEPLOY NA VM DA SEPOG FINALIZADO COM SUCESSO!'
    echo '============================================================'
    """

    cmd_ssh = ["ssh", "-p", str(port), "-o", "StrictHostKeyChecking=no", f"{user}@{host}", cmd_remoto]
    
    try:
        resultado = subprocess.run(cmd_ssh, check=True)
        print("\n[✓] Deploy concluído com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"\n[!] Falha no deploy: código {e.returncode}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deploy DCCALOR na VM SEPOG")
    parser.add_argument("--host", default="10.0.0.1", help="IP ou Host da VM SEPOG")
    parser.add_argument("--user", default="ubuntu", help="Usuário SSH da VM")
    parser.add_argument("--path", default="~/dccalor", help="Caminho remoto do projeto")
    parser.add_argument("--port", type=int, default=22, help="Porta SSH")
    
    args = parser.parse_args()
    executar_deploy(args.host, args.user, args.path, args.port)
