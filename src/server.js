import express from 'express';
import { initializeDatabase } from './config/database.js';
import { config } from './config/env.js';
import { validateApiKey } from './middleware/validateApiKey.js';

// Import routes
import healthRouter from './routes/health.js';
import dhtRouter from './routes/dht.js';
import pmsRouter from './routes/pms.js';

const app = express();

app.use(express.json());

// Apply API key validation to all routes except health
app.use('/health', healthRouter);
app.use('/dht', validateApiKey, dhtRouter);
app.use('/pms', validateApiKey, pmsRouter);

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

export { app, startServer };
