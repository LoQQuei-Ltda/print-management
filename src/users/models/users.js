const Log = require('../../../helper/log');
const { Core } = require('../../../db/core');
const CONSTANTS = require('../../../helper/constants');

module.exports = {
    /**
     * Coleta o usuário pelo ID
     * @param {string} id 
     * @returns 
     */
    getById: async (id) => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_SCHEMA}.users WHERE id = $1;`;
            const result = await Core(sql, [id]);
            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.USERS,
                operation: 'Get By Id',
                errorMessage: error.message,
                errorStack: error.stack
            });
            return {
                message: "Ocorreu um erro ao buscar o usuário! Tente novamente mais tarde"
            };
        }
    },
    /**
     * Insere um novo usuário
     * @param {Array} data 
     * @returns 
     */
    insert: async (data) => {
        try {
            const sql = `INSERT INTO ${process.env.DB_SCHEMA}.users (id, name, email, password, profile, createdAt, updatedAt, deletedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
            await Core(sql, data);
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.USERS,
                operation: 'Insert',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao inserir o usuário! Tente novamente mais tarde"
            };
        }
    },
    /**
     * Atualiza o usuário
     * @param {Array} data 
     * @returns 
     */
    update: async (data) => {
        try {
            const sql = `UPDATE ${process.env.DB_SCHEMA}.users SET name = $1, email = $2, password = $3, profile = $4, createdAt = $5, updatedAt = $6, deletedAt = $7 WHERE id = $8;`;
            await Core(sql, data);
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.USERS,
                operation: 'Update',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao atualizar o usuário! Tente novamente mais tarde"
            };
        }
    }
}