const dotenv = require('dotenv');
const { Core } = require('../../../db/core');

dotenv.config();

const Log = {
    /**
     * Insere um log
     * @param {Array} data 
     * @returns 
     */
    insert: async (data) => {
        try {
            const sql = `INSERT INTO ${process.env.DB_DATABASE}.logs (id, createdAt, logType, userId, entity, operation, beforeData, afterData, errorMessage, errorStack, userInfo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;

            const log = await Core(sql, data);

            return log;
        } catch {
            return {
                message: "Ocorreu um erro ao cadastrar o log! Tente novamente mais tarde"
            };
        }
    }
}

module.exports = Log;