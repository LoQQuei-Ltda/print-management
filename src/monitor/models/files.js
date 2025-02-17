const dotenv = require('dotenv');
const Log = require('../../../helper/log');
const { Core } = require('../../../db/core');
const CONSTANTS = require('../../../helper/constants');

dotenv.config();

module.exports = {
    getByUserId: async (id) => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_DATABASE}.filePages WHERE userId = $1 AND deletedAt IS NULL;`;

            const result = await Core(sql, [id]);

            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Get By User Id',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao obter os dados! Tente novamente mais tarde"
            }
        }
    },
    getSync: async () => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_DATABASE}.filePages WHERE synced = $1 AND printed = $2 AND deletedAt IS NULL;`;

            let result = await Core(sql, [false, true]);

            if (!Array.isArray(result)) {
                result = [result];
            }

            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Get Sync',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao obter os dados! Tente novamente mais tarde"
            }
        }
    },
    getById: async (id) => {
        try {
            const sql = `SELECT * FROM ${process.env.DB_DATABASE}.filePages WHERE id = $1;`;

            const result = await Core(sql, [id]);
            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Get By Id',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao obter os dados! Tente novamente mais tarde"
            }
        }
    },
    insert: async (data) => {
        try {
            const sql = `INSERT INTO ${process.env.DB_DATABASE}.filePages (id, userId, assetId, fileName, pages, path, createdAt, deletedAt, synced, printed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
            
            const result = await Core(sql, data);
            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Insert Data',
                errorMessage: error.message,
                errorStack: error.stack
            })

            return {
                message: "Ocorreu um erro ao inserir os dados! Tente novamente mais tarde"
            }
        }
    },
    updateSync: async (id) => {
        try {
            const sql = `UPDATE ${process.env.DB_DATABASE}.filePages SET synced = $1 WHERE id = $2;`;

            const result = await Core(sql, [true, id]);

            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Update Sync',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao atualizar os dados! Tente novamente mais tarde"
            }
        }
    },
    updatePrinted: async (id, assetId) => {
        try {
            const sql = `UPDATE ${process.env.DB_DATABASE}.filePages SET printed = $1, assetId = $2 WHERE id = $3;`;

            const result = await Core(sql, [true, assetId, id]);

            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Update Printed',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return {
                message: "Ocorreu um erro ao atualizar os dados! Tente novamente mais tarde"
            }
        }
    },
    delete: async (id) => {
        try {
            const sql = `UPDATE ${process.env.DB_DATABASE}.filePages SET deletedAt = $1 WHERE id = $2;`;

            const result = await Core(sql, [new Date(), id]);

            return result;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Delete Data',
                errorMessage: error.message,
                errorStack: error.stack
            })

            return {
                message: "Ocorreu um erro ao excluir os dados! Tente novamente mais tarde"
            }
        }
    }
}