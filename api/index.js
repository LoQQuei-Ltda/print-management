// Importações básicas
const express = require('express');

// Importações de middleware
const { authenticatedRoute }  = require('../middleware/authentication');

// Users
const { createUser, updateUser } = require('../src/users/controllers/users');


const router = express.Router();

// Users 
router.post('/users', authenticatedRoute, createUser);
router.put('/users', authenticatedRoute, updateUser);






module.exports = router;