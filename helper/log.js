const { v7: uuid} = require('uuid');
const CONSTANTS = require('./constants');
const Log = require('../src/logs/models/logs.js');

/**
 * Cria o log no banco de dados
 * @param {*} data 
 * @returns 
 */
const createLogDB = async (data) => {
    try {
        const { userId, entity, operation, beforeData, afterData, userInfo } = data;
    
        if (Array.isArray(beforeData) || Array.isArray(afterData)) {
            return {
                success: false,
                message: 'BeforeData ou afterData inválido!'
            }
        }

        await Log.insert([
            uuid(),
            new Date(),
            CONSTANTS.LOG.ERROR,
            userId || null,
            entity || null,
            operation || null,
            beforeData || null,
            afterData || null,
            null,
            null,
            userInfo || null
        ]);

        return {
            success: true
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

module.exports = {
    /**
     * Cria um log de erro com as informações enviadas no betterstack
     * @param {string} userId 
     * @param {string} entity 
     * @param {string} operation 
     * @param {string} beforeData 
     * @param {string} afterData 
     * @param {string} errorMessage
     * @param {string} errorStack
     * @param {*} userInfo 
     * @returns 
     */
    error: async (data) => {
        try {
            const { 
                userId = null, entity = null, operation = null, 
                beforeData = null, afterData = null, errorMessage = null, 
                errorStack = null, userInfo = null 
            } = data;
        
            const result = await createLogDB({
                userId, entity, operation, beforeData, afterData, 
                errorMessage, errorStack, userInfo
            });

            if (!result.success) {
                console.error(result.message);
            }

            await Log.deleteOld();

            return;
        } catch (error) {
            console.error(error);
            return
        }
    },
    createLogDB
}