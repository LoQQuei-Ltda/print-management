const snmp = require('net-snmp');
const CONSTANTS = require('../../../helper/constants');

/**
 * Coleta de informações do SNMP - Impressões
 * @param {string} ip 
 * @param {string} port 
 * @param {string} community 
 * @param {string} oid 
 * @returns {Promise<{data: string}>}
 */
const getPrintedPages = async (
    ip,
    port = CONSTANTS.SNMP.PORT,
    community = CONSTANTS.SNMP.COMMUNITY,
    oid = CONSTANTS.SNMP.OID_PAGES_TOTAL
) => {
    return new Promise((resolve, reject) => {
        const session = snmp.createSession(ip, community, { port });

        session.get([oid], (error, varbinds) => {
            session.close();

            if (error) {
                return reject({
                    success: false,
                    message: `Erro SNMP: ${error.message}`
                });
            }

            const varbind = varbinds[0];
            if (snmp.isVarbindError(varbind)) {
                return reject({
                    success: false,
                    message: `Erro no varbind: ${snmp.varbindError(varbind)}`
                });
            }

            const data = varbind.value?.toString() || '';
            resolve({ success: true, data });
        });

        session.on('error', (err) => {
            session.close();
            reject({
                success: false,
                message: `Erro na sessão SNMP: ${err.message}`
            });
        });
    });
};

/**
 * Coleta de informações do SNMP - Quantidade de tinta
 * @param {string} ip 
 * @param {string} port 
 * @param {string} community 
 * @returns {Promise<{[description: string]: string}>}
 */
const getTonerLevels = async (
    ip,
    port = CONSTANTS.SNMP.PORT,
    community = CONSTANTS.SNMP.COMMUNITY
) => {
    return new Promise((resolve, reject) => {
        const session = snmp.createSession(ip, community, { port });
        const tonerLevels = {};

        const tonerOids = CONSTANTS.SNMP.TONER_OIDS;

        session.get(tonerOids, (error, varbinds) => {
            session.close();

            if (error) {
                return reject({
                    success: false,
                    message: `Erro ao consultar níveis de toner: ${error.message}`
                });
            }

            for (const varbind of varbinds) {
                if (snmp.isVarbindError(varbind)) {
                    return reject({
                        success: false,
                        message: `Erro no varbind: ${snmp.varbindError(varbind)}`
                    });
                }

                const description = CONSTANTS.SNMP.TONER_DESCRIPTIONS[varbind.oid] || varbind.oid;
                const level = varbind.value?.toString() || '';
                tonerLevels[description] = level;
            }

            resolve({ success: true, tonerLevels });
        });

        session.on('error', (err) => {
            session.close();
            reject({
                success: false,
                message: `Erro na sessão SNMP: ${err.message}`
            });
        });
    });
};

module.exports = {
    getPrintedPages,
    getTonerLevels
};