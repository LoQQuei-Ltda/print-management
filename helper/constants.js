require('dotenv').config();

const CONSTANTS = {
    CUPS: {
        BASE_PATH: '/etc/cups',
    },
    LOG: {
        ERROR: 'error',
        MODULE: {
            MONITOR: 'monitor',
            TASK: 'task',
            USER: 'user',
        }
    },
    SAMBA: {
        BASE_PATH_FILES: 'C:\\Users\\eduardo.sirino\\Documents\\GitHub\\print-management\\monitor',
        BASE_PATH_FILES2: '/srv/print_server',
    },
    SERVER: {
        // IP: '177.54.87.225',
        // PORT: '53000'
        IP: 'localhost',
        PORT: '80',
        BASE_URL: 'http://localhost:80/api/v1',
        HEADERS: {
            headers: {
                'x-api-key': process.env.API_KEY
            }
        }
    },
    TIME_ZONE: 'America/Sao_Paulo',
}

module.exports = CONSTANTS;