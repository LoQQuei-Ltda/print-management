const Log = require('../../../helper/log');
const Files = require('../../monitor/models/files');
const CONSTANTS = require('../../../helper/constants');
const responseHandler = require('../../../helper/responseHandler');

module.exports = {
    getFiles: async (request, response) => {
        try {
            const id = request.params.id;

            const files = await Files.getByUserId(id);

            return responseHandler.success(response, 'Arquivos encontrados!', files);
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINT_JOBS,
                operation: 'Get Files',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return responseHandler.internalServerError(response, 'Ocorreu um erro ao obter os arquivos!');
        }
    }
}