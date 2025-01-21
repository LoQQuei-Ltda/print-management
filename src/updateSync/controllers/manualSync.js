const { sincronize } = require('../../task/controllers/init');
const responseHandler = require('../../../helper/responseHandler');

module.exports = {
    manualSync: async (request, response) => {
        responseHandler.success(response, 'Sincronização manual iniciada com sucesso!');
        
        setImmediate(async () => {
            await sincronize();
        });
    }
}