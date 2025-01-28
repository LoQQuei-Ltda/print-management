#!/bin/bash

echo "Atualizando pacotes..."
sudo apt update && sudo apt upgrade -y

echo "Instalando dependências..."
sudo apt install -y net-tools nano samba cups nginx postgresql ufw npm

echo "Clonando repositório..."
git clone https://github.com/LoQQuei-Ltda/print-management.git /opt/print-management
cd /opt/print-management
cp .env.example .env

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
sudo ufw enable

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
