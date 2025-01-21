// Importações básicas
const express = require('express');

// Importações de middleware
const { authenticatedRoute }  = require('../middleware/authentication');

// Users
const { createUser, updateUser } = require('../src/users/controllers/users');

// Sincronização manual
const { manualSync } = require('../src/updateSync/controllers/manualSync');

const router = express.Router();

// Users 
router.post('/users', authenticatedRoute, createUser);
router.put('/users', authenticatedRoute, updateUser);

router.post('/sync', authenticatedRoute, manualSync);




module.exports = router;