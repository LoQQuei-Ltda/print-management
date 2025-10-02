require('dotenv').config();

const CONSTANTS = {
    CUPS: {
        BASE_PATH: '/etc/cups',
    },
    LOG: {
        ERROR: 'error',
        MODULE: {
            MONITOR: 'monitor',
            PRINT_JOBS: 'print_jobs',
            PRINTERS: 'printers',
            TASK: 'task',
            USER: 'user',
        }
    },
    SAMBA: {
        BASE_PATH_FILES: '/srv/print_server'
    },
    SERVER: {
        IP: '10.148.1.53',
        PORT: '80',
        BASE_URL: 'http://10.148.1.53',
        HEADERS: {
            headers: {
                'x-api-key': process.env.API_KEY
            }
        }
    },
    SNMP: {
        PORT: 161,
        COMMUNITY: 'public',
        OID_PAGES_TOTAL: '1.3.6.1.2.1.43.10.2.1.4.1.1',
        TONER_OIDS: [
            '1.3.6.1.2.1.43.11.1.1.9.1.1',
            '1.3.6.1.2.1.43.11.1.1.9.1.2',
            '1.3.6.1.2.1.43.11.1.1.9.1.3',
            '1.3.6.1.2.1.43.11.1.1.9.1.4'
        ],
        TONER_DESCRIPTIONS: {
            '1.3.6.1.2.1.43.11.1.1.9.1.1': 'Preto',
            '1.3.6.1.2.1.43.11.1.1.9.1.2': 'Ciano',
            '1.3.6.1.2.1.43.11.1.1.9.1.3': 'Magenta',
            '1.3.6.1.2.1.43.11.1.1.9.1.4': 'Amarelo'
        },
        OID_DESCRIPTION: '1.3.6.1.2.1.43.11.1.1.6.1',
        OID_LEVEL: '1.3.6.1.2.1.43.11.1.1.9'
    },
    TIME_ZONE: 'America/Sao_Paulo',
    UPDATE: {
        DEFAULT_HOUR: 6,
        DEFAULT_MINUTE: 0
    }
}

module.exports = CONSTANTS;