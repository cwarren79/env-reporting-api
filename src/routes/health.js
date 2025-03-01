import express from 'express';
import { influxDB } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Try to actually query the database, not just ping
        await influxDB.getDatabaseNames();

        res.json({
            status: 'healthy',
            database: 'connected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
