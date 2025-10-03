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
                execSync(`sudo -n useradd -m -s /bin/bash --badname ${username}`);
                execSync(`sudo -n passwd -d ${username}`);
            }

            const userFolder = `${basePath}/${username}`;

            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }

            execSync(`sudo -n chown ${username}:${username} ${userFolder}`);
            execSync(`sudo -n chmod 777 ${userFolder}`);
        } catch (error) {
            console.error(error);
        }
    }
} 