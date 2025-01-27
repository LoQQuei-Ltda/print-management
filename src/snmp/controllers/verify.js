const axios = require('axios');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { getPrintedPages, getTonerLevels } = require('../helpers/snmp');

const printed = async (printer) => {
    const { ip, port, assetId } = printer;

    const pages = await getPrintedPages(ip, port);

    const response = await axios.post(`${CONSTANTS.SERVER.BASE_URL}/manager/printedPagesTotal`, {
        assetId,
        pages: pages.data
    }, CONSTANTS.SERVER.HEADERS);

    if (response.status !== 200) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.SNMP,
            operation: 'Printed',
            errorMessage: response.statusText,
            errorStack: response.statusText
        });
        
        return {
            success: false,
            message: 'Ocorreu um erro ao enviar a quantidade de páginas impressas!'
        };
    }

    return {
        success: true,
        message: 'Impressora sincronizada com sucesso!'
    };
};

const toner = async (printer) => {
    const { ip, port, assetId } = printer;

    const tonerLevels = await getTonerLevels(ip, port);

    const response = await axios.post(`${CONSTANTS.SERVER.BASE_URL}/manager/inkLevel`, {
        assetId,
        inkData: tonerLevels.tonerLevels
    }, CONSTANTS.SERVER.HEADERS);

    if (response.status !== 200) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.SNMP,
            operation: 'Toner',
            errorMessage: response.statusText,
            errorStack: response.statusText
        });
        
        return {
            success: false,
            message: 'Ocorreu um erro ao enviar a quantidade de tinta!'
        };
    }

    return {
        success: true,
        message: 'Impressora sincronizada com sucesso!'
    };
};


module.exports = {
    verifyAndSincronizeSNMP: async () => {
        try {
            const result = await axios.get(`${CONSTANTS.SERVER.BASE_URL}/manager/getSNMP`, CONSTANTS.SERVER.HEADERS);

            if (result.status !== 200) {
                Log.error({
                    entity: CONSTANTS.LOG.MODULE.SNMP,
                    operation: 'Verify SNMP',
                    errorMessage: result.statusText,
                    errorStack: result.statusText
                });
                
                return;
            }
            
            const printers = result.data.data;

            for (let printer of printers) {
                const [printedResult, tonerResult] = await Promise.allSettled([
                    printed(printer),
                    toner(printer)
                ]);

                if (tonerResult.status === 'rejected' || (tonerResult.value && !tonerResult.value.success)) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.SNMP,
                        operation: 'Printed',
                        errorMessage: tonerResult.reason ? tonerResult.reason.message : tonerResult.value.message,
                        errorStack: tonerResult.reason ? tonerResult.reason.stack : 'Erro desconhecido em toner'
                    });
                }
                
                if (printedResult.status === 'rejected' || (printedResult.value && !printedResult.value.success)) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.SNMP,
                        operation: 'Toner',
                        errorMessage: printedResult.reason ? printedResult.reason.message : printedResult.value.message,
                        errorStack: printedResult.reason ? printedResult.reason.stack : 'Erro desconhecido em printed'
                    });
                }
            }

            return;
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.SNMP,
                operation: 'Verify SNMP',
                errorMessage: error.message,
                errorStack: error.stack
            });
            
            console.error(error);
        }
    }
}