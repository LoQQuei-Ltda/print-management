const User = require('../models/users');
const Log = require('../../../helper/log');
const CONSTANTS = require('../../../helper/constants');
const { createUserInSO } = require('../helpers/userInSO');

module.exports = {
    createUser: async (request, response) => {
        try {
            const { id, name, email, password, profile, createdAt, deletedAt } = request.body;
            
            const result = await User.getById(id);
            if (result && result.id) {
                return response.status(400).json({ message: 'Usuário já existente!' });
            }

            const user = await User.insert([
                id,
                name,
                email,
                password,
                profile,
                createdAt,
                new Date(),
                deletedAt
            ]);

            if (user && user.message) {
                return response.status(400).json({ message: user.message });
            }

            await createUserInSO(id, email, password);

            return response.status(201).json({
                message: 'Usuário criado com sucesso!'
            });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.USER,
                operation: 'Create Users',
                errorMessage: error.message,
                errorStack: error.stack,
                userInfo: request.user.userInfo
            });
        }
    },
    updateUser: async (request, response) => {
        try {
            const { id, name, email, password, profile, createdAt, deletedAt } = request.body;

            const result = await User.getById(id);
            if (!result || result.id != id) {
                return response.status(400).json({ message: 'Usuário não encontrado!' });
            }

            const user = await User.update([
                name,
                email,
                password,
                profile,
                createdAt,
                new Date(),
                deletedAt,
                id
            ]);

            if (user && user.message) {
                return response.status(400).json({ message: user.message });
            }

            await createUserInSO(id, email, password);

            return response.status(201).json({
                message: 'Usuário alterado com sucesso!'
            });
        } catch (error) {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.USER,
                operation: 'Update Users',
                errorMessage: error.message,
                errorStack: error.stack,
                userInfo: request.user.userInfo
            });
        }
    },
    createUserInSO
}