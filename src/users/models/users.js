const dotenv = require('dotenv');
const Log = require('../../../helper/log');
const { Core } = require('../../../db/core');
const CONSTANTS = require('../../../helper/constants');

dotenv.config();

module.exports = {
    /**
     * Coleta o usuário pelo ID
     * @param {string} id 
     * @returns 
     */
    getById: async (id) => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_DATABASE}.users WHERE id = $1;`;
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
     * Coleta o usuário pelo username
     * @param {string} id 
     * @returns 
     */
    getByUsername: async (username) => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_DATABASE}.users WHERE username = $1;`;
            const result = await Core(sql, [username]);
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
            const sql = `INSERT INTO ${process.env.DB_DATABASE}.users (id, name, username, email, password, profile, createdAt, updatedAt, deletedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
            const result = await Core(sql, data);
            return result;
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
            const sql = `UPDATE ${process.env.DB_DATABASE}.users SET name = $1, username = $2, email = $3, password = $4, profile = $5, createdAt = $6, updatedAt = $7, deletedAt = $8 WHERE id = $9;`;
            const result = await Core(sql, data);
            return result;
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