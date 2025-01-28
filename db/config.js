const { Pool } = require('pg');
require("dotenv-safe").config();

/**
 * Criação do pool e configuração da conexão
*/
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: process.env.DB_CONNECTION_LIMIT || 9000,
});

module.exports = pool;