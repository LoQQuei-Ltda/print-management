const schedule = require('node-schedule');
const exec = require('child_process').exec;
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const responseHandler = require('../../../helper/responseHandler');

module.exports = {
    updateVersion: async (request, response) => {
        try {
            const { hour, minute } = request.body;

            if (!hour || !minute) {
                return responseHandler.badRequest(response, 'Hour e minute não podem ser vazios!');
            }

            const now = new Date();
            let scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
            
            if (scheduleDate <= now) {
                scheduleDate.setDate(scheduleDate.getDate() + 1);
            }

            responseHandler.success(response, `Update agendado com sucesso para às ${hour} horas e ${minute} minutos!`);

            setImmediate(() => {
                schedule.scheduleJob(scheduleDate, async () => {
                    console.log('Iniciando a atualização de versão...');
                    exec('sudo /opt/print-management/update.sh', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Erro ao executar update.sh: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`Erro na saída: ${stderr}`);
                            return;
                        }
                        console.log(`Saída do script: ${stdout}`);
                    });
                });
            });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.UPDATE,
                operation: 'Update Version',
                errorMessage: error.message,
                errorStack: error.stack
            });

            return responseHandler.badRequest(response, 'Ocorreu um erro ao atualizar a versão!');
        }       
    }
}