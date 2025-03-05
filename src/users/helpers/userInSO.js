const fs = require('fs');
const execSync = require('child_process').execSync;
const CONSTANTS = require('../../../helper/constants');

const basePath = CONSTANTS.SAMBA.BASE_PATH_FILES;

module.exports = {
    /**
     * Verifica e cria o usuário no sistema operacional e sua pasta no samba
     * @param {string} id 
     */
    createUserInSO: async (id) => {
        try {
            const username = id.replace(/-/g, '');
    
            try {
                execSync(`id -u ${username}`, { stdio: 'ignore' });
            } catch {
                execSync(`sudo useradd -m -s /bin/bash --badname ${username}`);
                execSync(`sudo passwd -d ${username}`);
            }
        
            const userFolder = `${basePath}/${username}`;
        
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }
        
            execSync(`sudo chown ${username}:${username} ${userFolder}`);
            execSync(`sudo chmod 777 ${userFolder}`);
        } catch (error) {
            console.error(error);
        }
    }
} 