const Files = require('../models/files');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { default: axios } = require('axios');

module.exports = {
    verifyAndSincronizeFiles: async () => {
        try {
            const result = await Files.getSync();

            if (result.message) {
                return console.error(result.message);
            }

            for (let file of result) {
                const { id, userid, pages, assetid, path  } = file;

                const body = {
                    userId: userid,
                    assetId: assetid,
                    pages,
                    fileId: path
                }

                let response;
                try {
                    response = await axios.post(`${CONSTANTS.SERVER.BASE_URL}/manager/printedByUser`, body, CONSTANTS.SERVER.HEADERS)
                } catch (error) {
                    try {
                        console.log(error.response.data.errors);
                    } catch { /* empty */ }

                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.TASK,
                        operation: 'Verify And Sincronize Files',
                        errorMessage: error.message,
                        errorStack: error.stack
                    });
                    
                    continue;
                }

                if (response.status !== 200) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.TASK,
                        operation: 'Verify And Sincronize Files',
                        errorMessage: response.statusText,
                        errorStack: response.statusText
                    });
                    
                    continue;
                }

                await Files.updateSync(id);
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