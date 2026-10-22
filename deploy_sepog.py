"""
Script de Deploy Automatizado em Python para a VM da SEPOG (172.31.3.60)
Lê credenciais de .env (VM_SSH_HOST, VM_SSH_USER, VM_SSH_PASSWORD, VM_REMOTE_PATH),
configura chave SSH automática para futuros deploys sem senha e valida a API do Observatório.
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path
import paramiko


def carregar_env(env_path: str = ".env") -> dict:
    env_vars = {}
    for caminho in [Path(env_path), Path.home() / ".env"]:
        if caminho.exists():
            for line in caminho.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars


def garantir_chave_ssh_local() -> str | None:
    ssh_dir = Path.home() / ".ssh"
    ssh_dir.mkdir(parents=True, exist_ok=True)
    key_path = ssh_dir / "id_ed25519"
    pub_path = ssh_dir / "id_ed25519.pub"

    if not pub_path.exists():
        try:
            subprocess.run(
                ["ssh-keygen", "-t", "ed25519", "-N", "", "-f", str(key_path)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            return None

    if pub_path.exists():
        return pub_path.read_text(encoding="utf-8").strip()
    return None


def executar_deploy(host: str, user: str, remote_path: str = "/root/dccalor", port: int = 22, password: str | None = None):
    print("=" * 65)
    print(f" [DCCALOR] INICIANDO DEPLOY AUTOMATIZADO NA VM SEPOG: {user}@{host}:{port}")
    print("=" * 65)

    pub_key = garantir_chave_ssh_local()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"[*] Conectando via SSH em {user}@{host}:{port}...")
        client.connect(
            hostname=host,
            port=port,
            username=user,
            password=password,
            timeout=15,
            look_for_keys=True,
            allow_agent=True,
        )
    except Exception as err:
        print(f"[!] Falha de autenticação SSH em {user}@{host}: {err}")
        print("[!] Verifique se VM_SSH_PASSWORD está configurada no arquivo .env.")
        sys.exit(1)

    # 1. Instalar chave pública SSH na VM para futuros deploys sem senha
    if pub_key:
        cmd_auth_key = (
            f"mkdir -p ~/.ssh && chmod 700 ~/.ssh && "
            f"(grep -qxF '{pub_key}' ~/.ssh/authorized_keys 2>/dev/null || echo '{pub_key}' >> ~/.ssh/authorized_keys) && "
            f"chmod 600 ~/.ssh/authorized_keys"
        )
        client.exec_command(cmd_auth_key)
        print("[✓] Chave SSH pública registrada na VM para futuros deploys diretos!")

    # 2. Executar atualização do repositório e deploy.sh na VM
    cmd_remoto = f"""
    set -e
    echo '[1/4] Acessando {remote_path} na VM...'
    if [ ! -d "{remote_path}" ]; then
        git clone https://github.com/NeudoMaia/dccalor.git "{remote_path}"
    fi
    cd "{remote_path}"

    echo '[2/4] Sincronizando código com GitHub (origin/main)...'
    git fetch origin main
    git reset --hard origin/main

    echo '[3/4] Executando script de deploy da VM (deploy.sh)...'
    bash deploy.sh

    echo '[4/4] Validando endpoints locais na VM...'
    curl -s http://127.0.0.1:3000/api/health || true
    echo ''
    curl -s http://127.0.0.1:3000/api/observatorio/info | head -c 400 || true
    echo ''
    """

    stdin, stdout, stderr = client.exec_command(cmd_remoto, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")

    exit_status = stdout.channel.recv_exit_status()
    client.close()

    if exit_status != 0:
        print(f"\n[!] O comando remoto retornou código {exit_status}")
        sys.exit(exit_status)

    print("\n" + "=" * 65)
    print(" [✓] DEPLOY NA VM SEPOG E API DO OBSERVATÓRIO CONCLUÍDOS COM SUCESSO!")
    print("=" * 65)


if __name__ == "__main__":
    env_vars = carregar_env()
    parser = argparse.ArgumentParser(description="Deploy Automatizado DCCALOR na VM SEPOG")
    parser.add_argument("--host", default=env_vars.get("VM_SSH_HOST", "172.31.3.60"), help="IP ou Host da VM SEPOG")
    parser.add_argument("--user", default=env_vars.get("VM_SSH_USER", "root"), help="Usuário SSH da VM")
    parser.add_argument("--path", default=env_vars.get("VM_REMOTE_PATH", "/root/dccalor"), help="Caminho remoto do projeto")
    parser.add_argument("--port", type=int, default=int(env_vars.get("VM_SSH_PORT", "22")), help="Porta SSH")

    args = parser.parse_args()
    senha_vm = os.environ.get("VM_SSH_PASSWORD") or env_vars.get("VM_SSH_PASSWORD")
    executar_deploy(args.host, args.user, args.path, args.port, senha_vm)
