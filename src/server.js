import express from 'express';
import { initializeDatabase } from './config/database.js';
import { config } from './config/env.js';
import { validateApiKey } from './middleware/validateApiKey.js';
import { limiter } from './middleware/rateLimit.js';

// Import routes
import healthRouter from './routes/health.js';
import dhtRouter from './routes/dht.js';
import pmsRouter from './routes/pms.js';

const app = express();

app.use(express.json());

// Apply routes
app.use('/health', healthRouter);
app.use('/dht', validateApiKey, limiter, dhtRouter);
app.use('/pms', validateApiKey, limiter, pmsRouter);

const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(config.port, () => {
      console.log(`Express server is listening on port ${config.port}`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

export { startServer };
