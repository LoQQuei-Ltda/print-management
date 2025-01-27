const fs = require('fs');
const execSync = require('child_process').execSync;
const CONSTANTS = require('../../../helper/constants');

const basePath = CONSTANTS.SAMBA.BASE_PATH_FILES;

module.exports = {
    /**
     * Verifica e cria o usuário no sistema operacional e sua pasta no samba
     * @param {string} id 
     * @param {string} password 
     */
    createUserInSO: async (id, password) => {
        const username = id
                            .replace('-', '').replace('-', '').replace('-', '').replace('-', '')
                            .replace('-', '').replace('-', '').replace('-', '').replace('-', '');

        try {
            execSync(`id -u ${username}`, { stdio: 'ignore' });
        } catch {
            execSync(`sudo useradd -m -s /bin/bash --badname ${username}`);
            execSync(`echo "${username}:${password}" | sudo chpasswd`);
        }
    
        const userFolder = `${basePath}/${username}`;
    
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
    
        execSync(`sudo chown ${username}:${username} ${userFolder}`);
        execSync(`sudo chmod 700 ${userFolder}`);
    }
} 