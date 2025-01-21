const axios = require('axios');
const Log = require('../../logs/models/logs');
const CONSTANTS = require('../../../helper/constants');

module.exports = {
    updateSync: async () => {
        try {
            await axios.post(CONSTANTS.SERVER.BASE_URL + '/manager/sync', CONSTANTS.SERVER.HEADERS);
        } catch (error) {
            Log.error({
                entity: 'task',
                operation: 'Update Sync',
                errorMessage: error.message,
                errorStack: error.stack
            });
            
            return {
                message: 'Ocorreu um erro ao sincronizar os dados.'
            }
        }
    }
}