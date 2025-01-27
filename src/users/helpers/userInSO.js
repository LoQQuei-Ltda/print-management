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
        id = id.replace('-', '');
        
        try {
            execSync(`id -u ${id}`, { stdio: 'ignore' });
        } catch {
            execSync(`sudo useradd -m -s /bin/bash --badname ${id}`);
            execSync(`echo "${id}:${password}" | sudo chpasswd`);
        }
    
        const userFolder = `${basePath}/${id}`;
    
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
    
        execSync(`sudo chown ${id}:${id} ${userFolder}`);
        execSync(`sudo chmod 700 ${userFolder}`);
    }
} 