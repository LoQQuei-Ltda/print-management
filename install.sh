#!/bin/bash

exec > /dev/null 2>&1

run_command() {
  local command="$1"
  local error_message="$2"

  eval "$command"
  
  if [ $? -ne 0 ]; then
    echo "$error_message"
    exit 1
  fi
}

echo "Atualizando pacotes..."
run_command "sudo apt update && sudo apt upgrade -y" "Erro ao atualizar pacotes."


echo "Instalando dependências..."
echo "Instalando dependências..."
run_command "sudo apt install -y nano samba cups nginx postgresql postgresql-contrib ufw npm jq" "Erro ao instalar dependências."

echo "Clonando repositório..."
echo "Clonando repositório..."
run_command "git clone https://github.com/LoQQuei-Ltda/print-management.git /opt/print-management" "Erro ao clonar repositório."
cd /opt/print-management || exit
run_command "cp .env.example .env" "Erro ao copiar o arquivo .env."

run_command "git config --global pull.rebase false" "Erro ao configurar git pull."
run_command "git config --global status.showUntrackedFiles no" "Erro ao configurar git status."

COMMIT_HASH=$(git rev-parse HEAD)
INSTALL_DATE=$(date +%Y-%m-%d)
echo "Salvando informações de instalação: Commit $COMMIT_HASH, Data $INSTALL_DATE"
echo "{
  \"commit_hash\": \"$COMMIT_HASH\",
  \"install_date\": \"$INSTALL_DATE\"
}" > /opt/print-management/version.json

UPDATE_DIR="/opt/print-management/updates"
EXECUTED_FILE="/opt/print-management/executed_updates.txt"

for i in $(seq -f "%02g" 1 99); do
  SCRIPT_FILE="$UPDATE_DIR/$i.sh"

  if [ -f "$SCRIPT_FILE" ]; then
    if ! grep -q "$i" "$EXECUTED_FILE"; then
      echo "Executando atualização $i..."
      run_command "bash $SCRIPT_FILE" "Erro ao executar a atualização $i."
      echo "$i" >> "$EXECUTED_FILE"
      echo "Atualização $i executada com sucesso!"
    else
      echo "Atualização $i já foi executada. Pulando..."
    fi
  fi
done

echo "Configurando Samba..."
run_command "sudo cp smb.conf /etc/samba/smb.conf" "Erro ao configurar Samba."
run_command "sudo mkdir -p /srv/print_server" "Erro ao criar diretório Samba."
run_command "sudo chown -R nobody:nogroup /srv/print_server" "Erro ao alterar permissões Samba."
run_command "sudo chmod -R 0777 /srv/print_server" "Erro ao alterar permissões Samba."
run_command "sudo systemctl restart smbd" "Erro ao reiniciar Samba."

echo "Configurando CUPS..."
run_command "sudo cupsctl --remote-any" "Erro ao configurar CUPS."
run_command "sudo cp cupsd.conf /etc/cups/cupsd.conf" "Erro ao copiar configuração CUPS."
run_command "sudo systemctl restart cups" "Erro ao reiniciar CUPS."

echo "Configurando firewall..."
run_command "sudo ufw allow 137,138/udp" "Erro ao configurar firewall (UDP)."
run_command "sudo ufw allow 22,139,445,631/tcp" "Erro ao configurar firewall (TCP)."
run_command "sudo ufw --force enable" "Erro ao habilitar firewall."

echo "Criando banco de dados PostgreSQL..."
run_command "sudo -u postgres createdb print_management" "Erro ao criar banco de dados PostgreSQL."

echo "Configurando Node.js..."
run_command "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash" "Erro ao instalar NVM."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
run_command "nvm install 20" "Erro ao instalar Node.js."
run_command "nvm use 20" "Erro ao usar Node.js 20."

echo "Instalando dependências Node.js..."
run_command "npm install" "Erro ao instalar dependências Node.js."

echo "Configurando servidor..."
run_command "npm run setup" "Erro ao configurar servidor."

echo "Criando usuário e senha do banco de dados PostgreSQL..."
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

if [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
  echo "Erro: Usuário ou senha do banco de dados não configurados no .env."
  exit 1
fi

run_command "sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE print_management TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF" "Erro ao configurar usuário no PostgreSQL."

echo "Iniciando migrações..."
run_command "chmod +x db/migrate.sh" "Erro ao configurar permissões do script de migração."
run_command "./db/migrate.sh" "Erro ao executar migrações."

echo "Configurando PM2..."
run_command "pm2 start ecosystem.config.js" "Erro ao iniciar PM2."
run_command "pm2 save" "Erro ao salvar configuração PM2."
run_command "pm2 startup" "Erro ao configurar PM2 para iniciar na inicialização."

echo "Configurando NGINX..."
run_command "sudo cp nginx.conf /etc/nginx/sites-available/print-management" "Erro ao configurar NGINX."
run_command "sudo ln -s /etc/nginx/sites-available/print-management /etc/nginx/sites-enabled/" "Erro ao criar link simbólico no NGINX."
run_command "sudo nginx -t" "Erro ao testar configuração do NGINX."
run_command "sudo systemctl reload nginx" "Erro ao recarregar NGINX."

echo "Instalação concluída com sucesso!"
