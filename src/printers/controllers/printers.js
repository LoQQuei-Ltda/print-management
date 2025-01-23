const Log = require('../../../helper/log');
const Printer = require('../models/printers');
const CONSTANTS = require('../../../helper/constants');
const responseHandler = require('../../../helper/responseHandler');

module.exports = {
    createPrinter: async (request, response) => {
        try {
            const { id, status, cupsName, createdAt } = request.body;
            
            if (!cupsName) {
                return response.status(400).json({ message: 'Nome da impressora inválido!' });
            }
            
            const result = await Printer.getById(id);
            if (result && result.id) {
                return response.status(400).json({ message: 'Impressora já existente!' });
            }

            const printer = await Printer.insert([
                id,
                cupsName,
                status,
                createdAt,
                new Date()
            ]);

            if (printer && printer.message) {
                return responseHandler.badRequest({ message: printer.message });
            }


            return responseHandler.created({ message: 'Impressora criada com sucesso!' });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINTERS,
                operation: 'Create Printers',
                errorMessage: error.message,
                errorStack: error.stack,
                userInfo: request.user.userInfo
            });

            return responseHandler.internalServerError({ message: 'Ocorreu um erro ao criar a impressora! Tente novamente mais tarde' });
        }
    },
    updatePrinter: async (request, response) => {
        try {
            const { id, status, cupsName } = request.body;

            if (!cupsName) {
                return response.status(400).json({ message: 'Nome da impressora inválido!' });
            }

            const result = await Printer.getById(id);

            if (!result || result.id != id) {
                return response.status(400).json({ message: 'Usuário não encontrado!' });
            }

            const printer = await Printer.update([
                cupsName,
                status,
                new Date(),
                id
            ]);

            if (printer && printer.message) {
                return response.status(400).json({ message: printer.message });
            }

            return response.status(201).json({
                message: 'Impressora alterada com sucesso!'
            });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.PRINTERS,
                operation: 'Update Printers',
                errorMessage: error.message,
                errorStack: error.stack,
                userInfo: request.user.userInfo
            });
        }
    }
}