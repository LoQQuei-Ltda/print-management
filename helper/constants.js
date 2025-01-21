const CONSTANTS = {
    CUPS: {
        BASE_PATH: '/etc/cups',
    },
    LOG: {
        ERROR: 'error',
        MODULE: {
            TASK: 'task',
            USER: 'user',
        }
    },
    SAMBA: {
        BASE_PATH_FILES: '/srv/print_server',
    },
    SERVER: {
        // IP: '177.54.87.225',
        // PORT: '53000'
        IP: 'localhost',
        PORT: '80'
    },
    TIME_ZONE: 'America/Sao_Paulo',
}

module.exports = CONSTANTS;