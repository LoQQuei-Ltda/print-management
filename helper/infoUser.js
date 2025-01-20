const os = require('os');

module.exports = {
    /**
     * Coleta as informações do usuário pela requisição
     * @param {*} req 
     * @returns 
     */
    getUserInfo: function (req) {
        /**
         * Coleta o endereço MAC do dispositivo
         * @returns 
         */
        function getMacAddress() {
            const networkInterfaces = os.networkInterfaces();
            const interfaceNames = Object.keys(networkInterfaces);
    
            for (const name of interfaceNames) {
                const networkInterface = networkInterfaces[name];
                const interfaceWithMac = networkInterface.find(
                    (iface) => iface.mac && iface.mac !== '00:00:00:00:00:00'
                );
    
                if (interfaceWithMac) {
                    return interfaceWithMac.mac;
                }
            }
    
            return 'MAC address not found';
        }

        // Coleta informações do dispositivo
        const ipv4 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ipv6 = req.connection.remoteAddress;
        const macAddress = getMacAddress();

        const userAgent = req.headers['user-agent'];
        const language = req.headers['accept-language'];

        const latitude = req.headers['latitude'] || 'Latitude não encontrada';
        const longitude = req.headers['longitude'] || 'Longitude não encontrada';

        const info = {
            ipv4,
            ipv6,
            macAddress,
            userAgent,
            language,
            latitude,
            longitude,
            hostname: os.hostname(),
            platform: os.platform(),
            architecture: os.arch(),
        };

        return JSON.stringify(info);
    }
}