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
        // BASE_PATH_FILES: 'C:\\Users\\eduardo.sirino\\Documents\\GitHub\\print-management\\monitor',
        BASE_PATH_FILES: '/srv/print_server',
        BASE_PATH_FILES2: '/srv/print_server',
    },
    SERVER: {
        // IP: '177.54.87.225',
        // PORT: '53000'
        // IP: '::1',
        IP: '172.31.240.1',
        PORT: '80',
        // BASE_URL: 'http://localhost:80/api/v1',
        BASE_URL: 'http://172.31.240.1:80/api/v1',
        HEADERS: {
            headers: {
                'x-api-key': process.env.API_KEY
            }
        }
    },
    TIME_ZONE: 'America/Sao_Paulo',
}

module.exports = CONSTANTS;