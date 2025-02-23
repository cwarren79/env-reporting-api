import express from 'express';
import { initializeDatabase } from './config/database.js';
import { config } from './config/env.js';
import { validateHmac } from './middleware/validateHmac.js';

// Import routes
import healthRouter from './routes/health.js';
import dhtRouter from './routes/dht.js';
import pmsRouter from './routes/pms.js';

const app = express();

app.use(express.json());

// Apply HMAC validation to all routes except health
app.use('/health', healthRouter);
app.use('/dht', validateHmac, dhtRouter);
app.use('/pms', validateHmac, pmsRouter);

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
