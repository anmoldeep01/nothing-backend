const { checkConnection } = require('./src/config/drive');

(async () => {
    console.log('Testing Drive Connection...');
    await checkConnection();
})();
