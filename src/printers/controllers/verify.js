const axios = require('axios');
const Log = require('../../../helper/log');
const Printers = require('../models/printers');
const CONSTANTS = require('../../../helper/constants');

module.exports = {
    /**
     * Verifica se os usuários estão sincronizados com o banco de dados
     * @returns 
     */
    verifyAndSincronizePrinters: async () => {
        try {
            const response = await axios.get(`${CONSTANTS.SERVER.BASE_URL}/manager/printers`, CONSTANTS.SERVER.HEADERS);

            let printers = response.data.data;

            if (!Array.isArray(printers)) {
                printers = [printers];
            }

            for (let printer of printers) {
                const { id, status, cupsName, createdAt } = printer;

                const dbPrinter = await Printers.getById(id);

                if (dbPrinter && dbPrinter.id) {
                    if (dbPrinter.deletedAt) {
                        continue;
                    }
                    
                    const { status: dbStatus, name: dbName } = dbPrinter;
                    
                    if (status !== dbStatus || cupsName !== dbName) {
                        await Printers.update([cupsName, status, new Date(), id]);
                    }
                } else {
                    await Printers.insert([id, cupsName, status, createdAt, new Date()]);
                }
            }

            return {
                message: 'Impressoras sincronizadas com sucesso!'
            };
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.TASK,
                operation: 'Verify And Sincronize Printers',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: 'Ocorreu um erro ao sincronizar as impressoras.'
            }
        }
    }
}