const microServiceApp = require('./micro-service-app');
const authServiceApp = require('./auth-service-app');

microServiceApp.listen(1447, () => console.log('microservice is up at 1447'));
authServiceApp.listen(1448, () => console.log('authservice is up at 1448'));
