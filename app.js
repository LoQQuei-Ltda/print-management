// Importações básicas
const cors = require('cors');
const logger = require('morgan');
const express = require('express');

// Constantes
const responseHandler = require('./helper/responseHandler');

// Importações de rotas
const apiRouter = require('./api/index');

// Importações de middlewares
const { userInfo } = require('./middleware/userInfo');

// Importações de tarefas
const { schedulerInit } = require('./src/task/controllers/init');

// Importações de monitor
const { monitorStart } = require('./src/monitor/controllers/monitor');


// Cria o aplicativo Express
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(userInfo);

// Tarefas
schedulerInit();

// Monitor
monitorStart();

// CORS
app.use(cors());

app.use('/api', apiRouter);

// Tratamento de erro 404
app.use(function(request, response) {
    return responseHandler.notFound(response, 'Not found');
});

module.exports = app;