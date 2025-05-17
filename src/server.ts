import express, { Express } from 'express';
import { initializeDatabase } from './config/database.js';
import { config } from './config/env.js';
import { validateApiKey } from './middleware/validateApiKey.js';
import { limiter } from './middleware/rateLimit.js';
import { Server } from 'http';
import logger, { stream } from './config/logger.js';
import morgan from 'morgan';

// Import routes
import healthRouter from './routes/health.js';
import dhtRouter from './routes/dht.js';
import pmsRouter from './routes/pms.js';

const app: Express = express();

// Add request logging middleware
app.use(morgan('combined', { stream }));

app.use(express.json());
app.set('trust proxy', 1)

// Apply routes
app.use('/health', healthRouter);
app.use('/dht', validateApiKey, limiter, dhtRouter);
app.use('/pms', validateApiKey, limiter, pmsRouter);

const startServer = async (): Promise<Server> => {
  try {
    await initializeDatabase();
    const server: Server = app.listen(config.port, () => {
      logger.info(`Express server is listening on port ${config.port}`);
    });
    return server;
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }
};

export { startServer };
