import { startServer } from './server.js';
import { Server } from 'http';
import logger from './config/logger.js';

const handleShutdown = (server: Server): void => {
  logger.info('Received shutdown signal. Starting graceful shutdown...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

startServer()
  .then((server: Server) => {
    // Handle graceful shutdown
    process.on('SIGTERM', () => handleShutdown(server));
    process.on('SIGINT', () => handleShutdown(server));
  })
  .catch((error: Error) => {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  });
