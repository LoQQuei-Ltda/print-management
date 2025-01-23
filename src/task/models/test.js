const Log = require('../../../helper/log');
const { Core } = require('../../../db/core');
const CONSTANTS = require('../../../helper/constants');

const Test = {
    /**
     * Coleta as tabelas do banco de dados
     * @returns 
     */
    tables: async () => {
        try {
            const sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1;';

            const tables = await Core(sql, [process.env.DB_DATABASE]);

            return tables;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.TASK,
                operation: 'Databases',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao coletar as tabelas! Tente novamente mais tarde"
            };
        }
    }
}

module.exports = Test;