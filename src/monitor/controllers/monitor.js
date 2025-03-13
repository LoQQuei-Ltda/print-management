const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { v7: uuid, validate: uuidValidate } = require('uuid');
const chokidar = require('chokidar');
const Log = require('../../../helper/log');
const FilesModel = require('../models/files');
const CONSTANTS = require('../../../helper/constants');
const User = require('../../users/models/users');
const { PDFDocument } = require('pdf-lib');

const getPages = async (filePath) => {
    try {
        const data = await fs.promises.readFile(filePath);
        const pdf = await PDFDocument.load(data);
        return pdf.getPageCount();
    } catch (error) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.MONITOR,
            operation: 'Get Pages',
            errorMessage: error.message,
            errorStack: error.stack
        });
        return 'Error';
    }
}

const deleteFile = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.MONITOR,
            operation: 'Delete File',
            errorMessage: error.message,
            errorStack: error.stack
        });
    }
}

const deleteOldFiles = async (dirPath) => {
    try {
        dotenv.config();
        const daysThreshold = parseInt(process.env.FILES_OLD_THRESHOLD_DAYS) || 10;
        const files = await fs.promises.readdir(dirPath);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.promises.stat(fullPath);
    
            if (stats.isDirectory()) {
                await deleteOldFiles(fullPath);
                continue;
            }
    
            if (stats.isFile() && stats.mtime < cutoffDate) {
                const id = file.replace(path.extname(file), '');
                await FilesModel.delete(id);

                await deleteFile(fullPath);
            }
        }
    } catch (error) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.MONITOR,
            operation: 'Delete Old Files',
            errorMessage: error.message,
            errorStack: error.stack
        });

        return;
    }
}

// Espera até que o arquivo não esteja sendo gravado e tenta renomeá-lo
const waitForFileAndRename = async (filePath) => {
    let attempts = 0;
    let isLocked = true;
    let lastModifiedTime = 0;

    while (isLocked && attempts < 60) {
        try {
            const stats = await fs.promises.stat(filePath);
            const currentModifiedTime = stats.mtime.getTime();

            if (currentModifiedTime === lastModifiedTime) {
                // Tenta renomear o arquivo
                const tempPath = filePath + '.tmp';
                await fs.promises.rename(filePath, tempPath);
                await fs.promises.rename(tempPath, filePath);
                isLocked = false;
            } else {
                lastModifiedTime = currentModifiedTime;
                console.log(`Esperando o arquivo ${filePath} terminar de ser gravado...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.log(`Arquivo ${filePath} ainda está em uso...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        attempts++;
    }

    if (isLocked) {
        Log.error({
            entity: CONSTANTS.LOG.MODULE.MONITOR,
            operation: 'WaitForFileAndRename',
            errorMessage: `O arquivo ${filePath} ainda está sendo gravado após múltiplas tentativas.`,
            errorStack: ''
        });
    }
};

module.exports = {
    monitorStart: async () => {
        const lastFile = new Set();

        if (!fs.existsSync(CONSTANTS.SAMBA.BASE_PATH_FILES)) {
            await fs.mkdirSync(CONSTANTS.SAMBA.BASE_PATH_FILES);
        }

        const watcher = chokidar.watch(CONSTANTS.SAMBA.BASE_PATH_FILES, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: false,
            depth: 99999,
            followSymlinks: false
        });

        watcher.on('add', async (filePath) => {
            try {
                const ext = path.extname(filePath);
                const fileExtension = ext.toLowerCase();

                if (fileExtension !== '.pdf') {
                    await deleteFile(filePath);
                    return;
                }

                if (path.dirname(filePath) === CONSTANTS.SAMBA.BASE_PATH_FILES) {
                    await deleteFile(filePath);
                    return;
                }

                const fileNameSave = path.basename(filePath);
                const fileName = fileNameSave.replace(ext, '');

                if (lastFile.has(fileName)) {
                    return;
                }

                const result = await FilesModel.getById(fileName);
                if (result && result.id) {
                    return;
                }

                const id = uuid();
                lastFile.add(id);

                const relativePath = path.relative(CONSTANTS.SAMBA.BASE_PATH_FILES, path.dirname(filePath));
                const parts = relativePath.split(path.sep);
                if (!parts || parts.length === 0) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.MONITOR,
                        operation: 'Extract User',
                        errorMessage: `Não foi possível extrair o usuário a partir do caminho: ${filePath}`,
                        errorStack: ''
                    });
                    return;
                }

                const userIdDashless = parts[0];

                const userResult = await User.getByUsername(userIdDashless);
                let user;
                if (Array.isArray(userResult)) {
                    user = userResult[0];
                } else {
                    user = userResult;
                }

                if (!user || !user.id) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.MONITOR,
                        operation: 'Get User',
                        errorMessage: `Usuário não encontrado para: ${userIdDashless}`,
                        errorStack: ''
                    });
                    return;
                }

                const userId = user.id;

                // Espera o arquivo ser gravado e não estar bloqueado
                await waitForFileAndRename(filePath);

                const pages = await getPages(filePath);

                if (pages === 'Error') {
                    return;
                }

                const newFilePath = path.join(path.dirname(filePath), id + ext);

                const data = [id, userId, null, fileNameSave, pages, newFilePath, new Date(), null, false, false];

                await FilesModel.insert(data);

                try {
                    await fs.promises.rename(filePath, newFilePath);
                } catch (error) {
                    Log.error({
                        entity: CONSTANTS.LOG.MODULE.MONITOR,
                        operation: 'Add',
                        errorMessage: error.message,
                        errorStack: error.stack
                    });
                }
            } catch (error) {
                console.error("Erro ao processar o arquivo:", filePath, error);
            }
        });

        watcher.on('change', async (filePath) => {
            const fileExtension = path.extname(filePath).toLowerCase();

            if (fileExtension !== '.pdf') {
                await deleteFile(filePath);
            }
        });

        watcher.on('unlink', async (filePath) => {
            if (fs.existsSync(filePath)) {
                return;
            }

            const fileId = path.basename(filePath).replace(path.extname(filePath), '');

            if (!uuidValidate(fileId)) {
                return;
            }

            const result = await FilesModel.getById(fileId);

            if (result && result.printed) {
                return;
            }

            await FilesModel.delete(fileId);
        });

        watcher.on('error', async (error) => {
            Log.error({
                entity: CONSTANTS.LOG.MODULE.MONITOR,
                operation: 'Monitor',
                errorMessage: error.message,
                errorStack: error.stack
            });
        });

        setInterval(() => {
            deleteOldFiles(CONSTANTS.SAMBA.BASE_PATH_FILES);
        }, 1000 * 60 * 60);
    }
};
