import express, { Request, Response } from 'express';
import { influxDB } from '../config/database.js';

const router = express.Router();

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    database: 'connected' | 'disconnected';
    uptime?: number;
    error?: string;
    timestamp: string;
}

router.get('/', async (req: Request, res: Response) => {
    try {
        // Try to actually query the database, not just ping
        await influxDB.getDatabaseNames();

        const response: HealthResponse = {
            status: 'healthy',
            database: 'connected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        console.error('Health check failed:', error);

        const response: HealthResponse = {
            status: 'unhealthy',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };

        res.status(503).json(response);
    }
});

export default router;
