const Log = require('../../../helper/log');
const { Core } = require('../../../db/core');
const CONSTANTS = require('../../../helper/constants');

module.exports = {
    getById: async (id) => {
        try {
            const sql = `SELECT id, name, status, createdAt, updatedAt, deletedAt FROM ${process.env.DB_DATABASE}.printers WHERE id = $1;`;

            const printer = await Core(sql, [id]);

            return printer;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINTER,
                operation: 'Get Printer',
                errorMessage: error.message,
                errorStack: error.stack
            })

            return {
                message: "Ocorreu um erro ao coletar o impressora! Tente novamente mais tarde"
            };
        }
    },
    insert: async (data) => {
        try {
            const sql = `INSERT INTO ${process.env.DB_DATABASE}.printers (id, name, status, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

            const printer = await Core(sql, data);

            return printer;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINTER,
                operation: 'New Printer',
                errorMessage: error.message,
                errorStack: error.stack
            })

            return {
                message: "Ocorreu um erro ao cadastrar o impressora! Tente novamente mais tarde"
            };
        }
    },
    update: async (data) => {
        try {
            const sql = `UPDATE ${process.env.DB_DATABASE}.printers SET name = $1, status = $2, updatedAt = $3 WHERE id = $4 RETURNING *;`;

            const printer = await Core(sql, data);

            return printer;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINTER,
                operation: 'Update Printer',
                errorMessage: error.message,
                errorStack: error.stack
            })

            return {
                message: "Ocorreu um erro ao alterar o impressora! Tente novamente mais tarde"
            };
        }
    },
}