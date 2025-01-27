const snmp = require('net-snmp');
const CONSTANTS = require('../../../helper/constants');

/**
 * Coleta de informações do SNMP - Impressões
 * @param {string} ip 
 * @param {string} port 
 * @param {string} community 
 * @param {string} oid 
 * @returns 
 */
const getPrintedPages = async (ip, port = CONSTANTS.SNMP.PORT, community = CONSTANTS.SNMP.COMMUNITY, oid = CONSTANTS.SNMP.OID_PAGES_TOTAL) => {
    return new Promise((resolve, reject) => {
        const session = snmp.createSession(ip, community, { port });

        session.get([oid], (error, varbinds) => {
            session.close();

            if (error) {
                return reject({
                    message: `Erro SNMP: ${error.toString()}`
                });
            }

            for (const varbind of varbinds) {
                if (snmp.isVarbindError(varbind)) {
                    return reject({
                        message: `Erro no varbind: ${snmp.varbindError(varbind)}`
                    });
                }
            }

            const data = varbinds[0].value.toString();

            resolve({
                data
            });
        });

        session.on('error', (err) => {
            session.close();
            reject({
                message: `Erro na sessão SNMP: ${err.toString()}`
            });
        });
    });
};

/**
 * Coleta de informações do SNMP - Quantidade de tinta
 * @param {string} ip 
 * @param {string} port 
 * @param {string} community 
 * @returns 
 */
const getTonerLevels = async (ip, port = CONSTANTS.SNMP.PORT, community = CONSTANTS.SNMP.COMMUNITY) => {
    const session = snmp.createSession(ip, community, { port });

    return new Promise((resolve, reject) => {
        const tonerLevels = {};

        const finalize = () => {
            session.close();
            resolve(tonerLevels);
        };

        session.walk(CONSTANTS.SNMP.OID_DESCRIPTION, (varbind) => {
            if (snmp.isVarbindError(varbind)) {
                reject({
                    success: false,
                    message: `Erro no varbind de descrição: ${snmp.varbindError(varbind)}`
                });
                session.close();
                return false;
            }

            const oidParts = varbind.oid.split('.');
            const index = oidParts[oidParts.length - 1];
            const description = varbind.value.toString();

            const oidLevel = `${CONSTANTS.SNMP.OID_LEVEL}.${index}`;
            session.get([oidLevel], (error, varbindsLevel) => {
                if (error) {
                    reject({
                        success: false,
                        message: `Erro ao consultar nível SNMP: ${error.toString()}`
                    });
                    session.close();
                    return;
                }

                const varbindLevel = varbindsLevel[0];
                if (snmp.isVarbindError(varbindLevel)) {
                    reject({
                        success: false,
                        message: `Erro no varbind de nível para OID ${varbindLevel.oid}: ${snmp.varbindError(varbindLevel)}`
                    });
                    session.close();
                    return;
                }

                const level = varbindLevel.value.toString();
                tonerLevels[description] = level;
            });
        }, (error) => {
            if (error) {
                reject({
                    success: false,
                    message: `Erro durante o walk SNMP: ${error.toString()}`
                });
            } else {
                finalize();
            }
        });
    });
};

module.exports = {
    getPrintedPages: getPrintedPages,
    getTonerLevels: getTonerLevels
};