const dotenv = require('dotenv');
const Log = require("../helper/log");
const CONSTANTS = require('../helper/constants');
const responseHandler = require('../helper/responseHandler');

dotenv.config();

module.exports = {
    /**
     * Middleware para verificar a autenticação
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     * @returns 
     */
    authenticatedRoute: async (request, response, next) => {
        try {
            const apiKey = request.headers['x-api-key'];
            if (!apiKey) {
                return responseHandler.unauthorized(response, 'Não autenticado');
            }

            let result = process.env.API_KEY;

            if (!result) {
                console.error('API_KEY não configurado!');
                Log.error({
                    entity: CONSTANTS.LOG.MODULE.MIDDLEWARE,
                    operation: 'API Key',
                    errorMessage: 'API_KEY não configurado!',
                    errorStack: null
                });
                return responseHandler.internalServerError(response, 'API Key não configurado!');
            }

            if (apiKey !== result) {
                return responseHandler.forbidden(response, 'Chave de API inválida!');
            }

            request.device = result;
            next();
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MIDDLEWARE,
                operation: 'User Info',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return responseHandler.internalServerError(response, 'Erro ao validar token');
        }
    }
}

