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

            for (const varbind of varbinds) {
                if (snmp.isVarbindError(varbind)) {
                    return reject({
                        success: false,
                        message: `Erro no varbind: ${snmp.varbindError(varbind)}`
                    });
                }
            }

            const data = varbinds[0]?.value?.toString() || '';
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

        session.walk(
            CONSTANTS.SNMP.OID_DESCRIPTION,
            (varbind) => {
                if (snmp.isVarbindError(varbind)) {
                    reject({
                        success: false,
                        message: `Erro no varbind de descrição: ${snmp.varbindError(varbind)}`
                    });
                    session.close();
                    return false;
                }

                console.log(varbind);
                if (!varbind.oid) {
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
                            message: `Erro ao consultar nível SNMP: ${error.message}`
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

                    const level = varbindLevel.value?.toString() || '';
                    tonerLevels[description] = level;
                });
            },
            (error) => {
                session.close();
                if (error) {
                    reject({
                        success: false,
                        message: `Erro durante o walk SNMP: ${error.message}`
                    });
                } else {
                    resolve({ success: true, tonerLevels });
                }
            }
        );

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
