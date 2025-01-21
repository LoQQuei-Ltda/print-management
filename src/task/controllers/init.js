const Test = require('../models/test');
const schedule = require('node-schedule');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { updateSync } = require('../../updateSync/controllers/sync');
const { verifyAndSincronizeUsers } = require('../../users/controllers/verify');

const sincronize = async () => {
    verifyAndSincronizeUsers();


    
    updateSync();
}

module.exports = {
    schedulerInit: async () => {
        try {
            const result = await Test.tables();
    
            if (result.message) {
                return console.error(result.message);
            }
    
            // const timezone = CONSTANTS.TIME_ZONE;
    
            await sincronize();
    
            // Executa a sincronização de usuários a cada hora
            schedule.scheduleJob('* * * * *', async () => {
                await verifyAndSincronizeUsers();


                await updateSync();
            });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.TASK,
                operation: 'Init Task',
                errorMessage: error.message,
                errorStack: error.stack
            });
            
            console.error(error);
        }
    },
    sincronize
}
