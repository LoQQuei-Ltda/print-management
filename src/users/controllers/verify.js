const axios = require('axios');
const User = require('../models/users');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { createUserInSO } = require('../helpers/userInSO');

module.exports = {
    /**
     * Verifica se os usuários estão sincronizados com o banco de dados
     * @returns 
     */
    verifyAndSincronizeUsers: async () => {
        try {
            const serverIp = CONSTANTS.SERVER.IP;
            const serverPort = CONSTANTS.SERVER.PORT;

            const response = await axios.get(`http://${serverIp}:${serverPort}/api/v1/manager/users`, {
                headers: {
                    'x-api-key': process.env.API_KEY
                }
            });

            let institutionUsers = response.data.data;

            if (!Array.isArray(institutionUsers)) {
                institutionUsers = [institutionUsers];
            }

            for (let user of institutionUsers) {
                const { id, name, email, password, profile, createdAt, deletedAt } = user;

                const dbUser = await User.getById(id);

                if (dbUser && dbUser.id) {
                    if (dbUser.deletedAt) {
                        continue;
                    }
                    
                    const { name: dbName, email: dbEmail, password: dbPassword, profile: dbProfile, createdAt: dbCreatedAt, deletedAt: dbDeletedAt } = dbUser;
                    
                    if (name !== dbName || email !== dbEmail || password !== dbPassword || profile !== dbProfile || createdAt !== dbCreatedAt || deletedAt !== dbDeletedAt) {
                        await User.update([name, email, password, profile, createdAt, new Date(), deletedAt, id]);
                    }
                } else {
                    await User.insert([id, name, email, password, profile, createdAt, new Date(), deletedAt]);
                }

                await createUserInSO(id, email, password);
            }

            return {
                message: 'Usuários sincronizados com sucesso!'
            };
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.TASK,
                operation: 'Verify And Sincronize Users',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: 'Ocorreu um erro ao sincronizar os usuários.'
            }
        }
    }
}