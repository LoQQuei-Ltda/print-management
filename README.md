# print-management
 
sudo apt update && sudo apt upgrade -y

sudo apt install net-tools nano samba cups nginx postgresql ufw pm2 -y

sudo nano /etc/samba/smb.conf

Ai coloca o smb.conf

sudo systemctl restart smbd

sudo mkdir -p /srv/print_server

sudo chown -R nobody:nogroup /srv/print_server
sudo chmod -R 0777 /srv/print_server
sudo chmod -R 775 /srv/print_server

sudo cupsctl --remote-any
sudo systemctl restart cups


sudo ufw allow 137,138/udp
sudo ufw allow 22,139,445,631/tcp
sudo ufw enable

sudo -u postgres createdb print_management

sudo nano /etc/cups/cupsd.conf

Ai coloca o cupsd.conf

sudo -u postgres psql

\c print_management


NODE

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" 

nvm install 20

node -v
nvm current

nano .env

chmod +x db/migrate.sh
sudo ./db/migrate.sh


npm install
npm start

PM2

sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

