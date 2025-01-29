#!/bin/bash

echo "Atualizando pacotes..."
sudo apt update && sudo apt upgrade -y

echo "Instalando dependências..."
sudo apt install -y nano samba cups nginx postgresql postgresql-contrib ufw npm jq

echo "Clonando repositório..."
git clone https://github.com/LoQQuei-Ltda/print-management.git /opt/print-management
cd /opt/print-management
cp .env.example .env

git config --global pull.rebase false
git config --global status.showUntrackedFiles no

COMMIT_HASH=$(git rev-parse HEAD)
INSTALL_DATE=$(date +%Y-%m-%d)

echo "Salvando informações de instalação: Commit $COMMIT_HASH, Data $INSTALL_DATE"

# Criando o arquivo JSON
echo "{
  \"commit_hash\": \"$COMMIT_HASH\",
  \"install_date\": \"$INSTALL_DATE\"
}" > /opt/print-management/version.json

UPDATE_DIR="/opt/print-management/updates"
EXECUTED_FILE="/opt/print-management/executed_updates.txt"

if [ ! -f "$EXECUTED_FILE" ]; then
  touch "$EXECUTED_FILE"
fi

for i in $(seq -f "%02g" 1 99); do
  SCRIPT_FILE="$UPDATE_DIR/$i.sh"

  if [ -f "$SCRIPT_FILE" ]; then
    if ! grep -q "$i" "$EXECUTED_FILE"; then
      echo "Executando atualização $i..."

      bash "$SCRIPT_FILE"

      echo "$i" >> "$EXECUTED_FILE"
      echo "Atualização $i executada com sucesso!"
    else
      echo "Atualização $i já foi executada. Pulando..."
    fi
  fi
done

echo "Configurando Samba..."
sudo cp smb.conf /etc/samba/smb.conf
sudo mkdir -p /srv/print_server
sudo chown -R nobody:nogroup /srv/print_server
sudo chmod -R 0777 /srv/print_server
sudo chmod -R 775 /srv/print_server
sudo systemctl restart smbd

echo "Configurando CUPS..."
sudo cupsctl --remote-any
sudo cp cupsd.conf /etc/cups/cupsd.conf
sudo systemctl restart cups

echo "Configurando firewall..."
sudo ufw allow 137,138/udp
sudo ufw allow 22,139,445,631/tcp
sudo ufw --force enable

echo "Criando banco de dados PostgreSQL..."
sudo -u postgres createdb print_management

echo "Configurando Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 20
nvm use 20

echo "Instalando dependências Node.js..."
npm install

echo "Configurando servidor..."
npm run setup

echo "Criando usuário e senha do banco de dados PostgreSQL..."
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

if [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
  echo "Erro: Usuário ou senha do banco de dados não configurados no .env."
  exit 1
fi

sudo -u postgres psql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE print_management TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF

echo "Iniciando migrações..."
chmod +x db/migrate.sh
./db/migrate.sh

echo "Configurando PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Configurando NGINX..."
sudo cp nginx.conf /etc/nginx/sites-available/print-management
sudo ln -s /etc/nginx/sites-available/print-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "Instalação concluída com sucesso!"
