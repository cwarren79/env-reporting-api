import express from 'express';
import { initializeDatabase } from './config/database.js';
import { config } from './config/env.js';

// Import routes
import healthRouter from './routes/health.js';
import dhtRouter from './routes/dht.js';
import pmsRouter from './routes/pms.js';

const app = express();

app.use(express.json());

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== config.apiKey) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

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

export const server = await startServer();
