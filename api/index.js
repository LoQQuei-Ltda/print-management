// Importações básicas
const express = require('express');

// Resposta
const responseHandler = require('../helper/responseHandler');

// Importações de middleware
const { authenticatedRoute }  = require('../middleware/authentication');

// Users
const { createUser, updateUser } = require('../src/users/controllers/users');

// Sincronização manual
const { manualSync } = require('../src/updateSync/controllers/manualSync');

// Printers
const { createPrinter, updatePrinter, getPrinters } = require('../src/printers/controllers/printers');

// Files
const { getFiles } = require('../src/jobs/controllers/files');

// Print File
const { printFile } = require('../src/jobs/controllers/print');

// Update
const { updateVersion } = require('../src/update/controllers/updateVersion');


const router = express.Router();

// Teste
router.get('/', async (request, response) => {
    return responseHandler.success(response, 'API ok');
});

// Users 
router.post('/users', authenticatedRoute, createUser);
router.put('/users', authenticatedRoute, updateUser);

// Sync
router.post('/sync', authenticatedRoute, manualSync);

// Printers
router.get('/printers', authenticatedRoute, getPrinters);
router.post('/printers', authenticatedRoute, createPrinter);
router.put('/printers', authenticatedRoute, updatePrinter);

// Files
router.get('/files/:id', authenticatedRoute, getFiles);

// Print File
router.post('/print', authenticatedRoute, printFile);

// Update
router.post('/update', authenticatedRoute, updateVersion);


module.exports = router;