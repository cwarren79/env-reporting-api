import { startServer } from './server.js';

const handleShutdown = (server) => {
  console.log('\nReceived shutdown signal. Starting graceful shutdown...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

startServer()
  .then(server => {
    // Handle graceful shutdown
    process.on('SIGTERM', () => handleShutdown(server));
    process.on('SIGINT', () => handleShutdown(server));
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
