const Test = require('../models/test');
const schedule = require('node-schedule');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { updateSync } = require('../../updateSync/controllers/sync');
const { verifyAndSincronizeSNMP } = require('../../snmp/controllers/verify');
const { verifyAndSincronizeUsers } = require('../../users/controllers/verify');
const { verifyAndSincronizeFiles } = require('../../monitor/controllers/verify');
const { verifyAndSincronizePrinters } = require('../../printers/controllers/verify');

const sincronize = async () => {
    verifyAndSincronizeUsers();
    verifyAndSincronizeFiles();
    verifyAndSincronizePrinters();
    verifyAndSincronizeSNMP();
    
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
                await verifyAndSincronizeFiles();
                await verifyAndSincronizePrinters();

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
