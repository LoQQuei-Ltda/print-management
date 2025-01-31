#!/bin/bash

run_command() {
  local command="$1"
  local error_message="$2"

  eval "$command" > /dev/null 2>&1
  
  if [ $? -ne 0 ]; then
    echo "$error_message"
    exit 1
  fi
}

echo "Atualizando pacotes..."
run_command "sudo apt update && sudo apt upgrade -y" "Erro ao atualizar pacotes."

echo "Instalando dependências..."
run_command "sudo apt install -y nano samba cups nginx postgresql postgresql-contrib ufw npm jq" "Erro ao instalar dependências."

echo "Clonando repositório..."
run_command "sudo git clone https://github.com/LoQQuei-Ltda/print-management.git /opt/print-management" "Erro ao clonar repositório."
cd /opt/print-management || exit
run_command "cp .env.example .env" "Erro ao copiar o arquivo .env."

run_command "sudo git config --global pull.rebase false" "Erro ao configurar git pull."
run_command "sudo git config --global status.showUntrackedFiles no" "Erro ao configurar git status."

COMMIT_HASH=$(git rev-parse HEAD)
INSTALL_DATE=$(date +%Y-%m-%d)
echo "Salvando informações de instalação: Commit $COMMIT_HASH, Data $INSTALL_DATE"
echo "{
  \"commit_hash\": \"$COMMIT_HASH\",
  \"install_date\": \"$INSTALL_DATE\"
}" > /opt/print-management/version.json

UPDATE_DIR="/opt/print-management/updates"
EXECUTED_FILE="/opt/print-management/executed_updates.txt"

if [ ! -f "$EXECUTED_FILE" ]; then
  echo "Arquivo de atualizações executadas não encontrado. Criando o arquivo..."
  touch "$EXECUTED_FILE"
fi

for i in $(seq -f "%02g" 1 99); do
  SCRIPT_FILE="$UPDATE_DIR/$i.sh"

  if [ -f "$SCRIPT_FILE" ]; then
    if ! grep -q "$i" "$EXECUTED_FILE"; then
      echo "Executando atualização $i..."
      run_command "sudo bash $SCRIPT_FILE" "Erro ao executar a atualização $i."
      echo "$i" | sudo tee -a "$EXECUTED_FILE" > /dev/null
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

echo "Configurando Node.js..."
run_command 'sudo bash -c "$(curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh)"' "Erro ao instalar NVM."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
run_command "nvm install 20" "Erro ao instalar Node.js."
run_command "nvm use 20" "Erro ao usar Node.js 20."

echo "Instalando dependências do projeto..."
run_command "sudo npm install npm@latest" "Erro ao instalar atualização do npm."
run_command "sudo npm install" "Erro ao instalar dependências Node.js."

echo "Configurando servidor..."
node /opt/print-management/setup.js

echo "Configurando firewall..."
PORT=$(grep '^PORT=' .env | cut -d '=' -f2 | tr -d '[:space:]')

if [[ -z "$PORT" ]]; then
    echo "Erro: A variável PORT não foi definida corretamente no .env"
    exit 1
fi

run_command "sudo ufw allow 137/udp" "Erro ao configurar firewall (porta 137 UDP)."
run_command "sudo ufw allow 138/udp" "Erro ao configurar firewall (porta 138 UDP)."
run_command "sudo ufw allow 22/tcp" "Erro ao configurar firewall (porta 22 TCP)."
run_command "sudo ufw allow 139/tcp" "Erro ao configurar firewall (porta 139 TCP)."
run_command "sudo ufw allow 445/tcp" "Erro ao configurar firewall (porta 445 TCP)."
run_command "sudo ufw allow 631/tcp" "Erro ao configurar firewall (porta 631 TCP)."
run_command "sudo ufw allow $PORT/tcp" "Erro ao configurar firewall (porta $PORT TCP)."
run_command "sudo ufw --force enable" "Erro ao habilitar firewall."

echo "Criando banco de dados PostgreSQL..."
DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2)
run_command 'sudo -u postgres psql -c "create database '$DB_DATABASE'"' "Erro ao criar banco de dados PostgreSQL."

echo "Criando usuário e senha do banco de dados PostgreSQL..."
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

if [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
  echo "Erro: Usuário ou senha do banco de dados não configurados no .env."
  exit 1
fi

run_command "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\"" "Erro ao criar usuário no banco de dados PostgreSQL."
run_command 'sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE '$DB_DATABASE' TO '$DB_USER';"' 'Erro ao conceder privilégios ao usuário no banco de dados PostgreSQL.'
run_command 'sudo -u postgres psql -c "ALTER USER '$DB_USER' WITH SUPERUSER;"' 'Erro ao conceder privilégios ao usuário na tabela do banco de dados PostgreSQL.'

echo "Iniciando migrações..."
run_command "sudo chmod +x db/migrate.sh" "Erro ao configurar permissões do script de migração."
run_command "sudo ./db/migrate.sh" "Erro ao executar migrações."
 
echo "Configurando PM2..."
run_command "sudo npm install -g pm2" "Erro ao instalar PM2."
run_command "pm2 start ecosystem.config.js" "Erro ao iniciar PM2."
run_command "sudo pm2 save" "Erro ao salvar configuração PM2."
run_command "sudo pm2 startup" "Erro ao configurar PM2 para iniciar na inicialização."

echo "Configurando NGINX..."
run_command "sudo cp nginx.conf /etc/nginx/sites-available/print-management" "Erro ao configurar NGINX."
run_command "sudo ln -s /etc/nginx/sites-available/print-management /etc/nginx/sites-enabled/" "Erro ao criar link simbólico no NGINX."
run_command "sudo nginx -t" "Erro ao testar configuração do NGINX."
run_command "sudo systemctl reload nginx" "Erro ao recarregar NGINX."

echo "Limpando sistema..."
run_command "sudo apt autoclean -y" "Erro ao limpar sistema."
run_command "sudo apt autoremove -y" "Erro ao limpar sistema."
run_command "sudo journalctl --vacuum-time=7d" "Erro ao limpar registro de sistema."

echo "Instalação concluída com sucesso!"
