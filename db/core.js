const pool = require('./config');

/**
 * Valida se a conexão é válida
 * @param {*} connection 
 * @returns 
 */
function isValidConnection(connection) {
    return connection &&
        typeof connection.query === 'function' &&
        typeof connection.release === 'function';
}

module.exports = {
    /**
     * Executa a consulta com os dados
     * @param {string} sql 
     * @param {*} data
     * @param {Object} connection 
     * @returns 
     */
    Core: async (sql, data, connection = null) => {
        if (connection) {
            if (!isValidConnection(connection)) {
                return {
                    message: 'Conexão inválida!'
                };
            }

            const { rows } = await connection.query(sql, data);
            if (rows.length === 1) {
                return rows[0];
            }
            return rows;
        }

        const { rows } = await pool.query(sql, data);
        if (rows.length === 1) {
            return rows[0];
        }
        return rows;
    },
    /**
     * Cria uma transação
     * @returns 
     */
    transaction: async () => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            if (!isValidConnection(client)) {
                return {
                    message: 'Não foi possível iniciar a transação!'
                };
            }
            return client;
        } catch (error) {
            await client.release();
            return {
                message: error.message
            };
        }
    },
    /**
     * Confirma a transação e libera a conexão
     * @param {Object} client 
     * @returns  {Promise<void>}
     */
    commit: async (client) => {
        if (!isValidConnection(client)) {
            return {
                message: 'Conexão inválida, não foi possível confirmar a transação!'
            };
        }

        try {
            await client.query('COMMIT');
        } finally {
            client.release();
        }
    },
    /**
     * Cancela a transação e libera a conexão
     * @param {Object} client 
     * @returns  {Promise<void>}
     */
    rollback: async (client) => {
        if (!isValidConnection(client)) {
            return {
                message: 'Conexão inválida, não foi possível cancelar a transação!'
            };
        }

        try {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    },
};