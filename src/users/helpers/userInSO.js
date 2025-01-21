const fs = require('fs');
const execSync = require('child_process').execSync;
const CONSTANTS = require('../../../helper/constants');

const basePath = CONSTANTS.SAMBA.BASE_PATH_FILES;

module.exports = {
    /**
     * Verifica e cria o usuário no sistema operacional e sua pasta no samba
     * @param {string} id 
     * @param {string} email 
     * @param {string} password 
     */
    createUserInSO: async (id, email, password) => {
        try {
            execSync(`id -u ${email}`, { stdio: 'ignore' });
        } catch {
            execSync(`sudo useradd -m -s /bin/bash ${email}`);
            execSync(`echo "${email}:${password}" | sudo chpasswd`);
        }
    
        const userFolder = `${basePath}/${id}`;
    
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
    
        execSync(`sudo chown ${email}:${email} ${userFolder}`);
        execSync(`sudo chmod 700 ${userFolder}`);
    }
} 