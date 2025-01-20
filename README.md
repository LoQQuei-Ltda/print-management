# print-management
 
sudo apt update && sudo apt upgrade -y

sudo apt install net-tools nano samba cups nginx postgresql ufw -y

sudo nano /etc/samba/smb.conf

Ai coloca o smb.conf

sudo systemctl restart smbd

sudo mkdir -p /srv/print_server

sudo chown -R nobody:nogroup /srv/print_server
sudo chmod -R 0777 /srv/print_server

sudo cupsctl --remote-any
sudo systemctl restart cups


sudo ufw allow 137,138/udp
sudo ufw allow 22,139,445,631/tcp
sudo ufw enable

sudo -u postgres createdb print_management

sudo nano /etc/cups/cupsd.conf

Ai coloca o cupsd.conf

sudo -u postgres psql

CREATE DATABASE print_management;

\c print_management