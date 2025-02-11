import express from 'express';
import { influxDB } from '../config/database.js';
import { isNumber, sendError, writeToInflux, extractSensorTag } from '../utils/helpers.js';

const router = express.Router();

// Validation middleware for DHT endpoint
export const validateDHT = (req, res, next) => {
    const { tags, temperature, humidity } = req.body;

    // Validate tags
    if (!Array.isArray(tags) || !tags.length) {
        return sendError(res, 400, 'tags must be a non-empty array');
    }

    // Validate at least one measurement is present
    if (temperature === undefined && humidity === undefined) {
        return sendError(res, 400, 'temperature or humidity is required');
    }

    // Validate measurements if present
    if (temperature !== undefined && !isNumber(temperature)) {
        return sendError(res, 400, 'temperature must be a number');
    }

    if (humidity !== undefined && !isNumber(humidity)) {
        return sendError(res, 400, 'humidity must be a number');
    }

    next();
};

router.post('/', validateDHT, async (req, res) => {
    const { tags, temperature, humidity } = req.body;

    try {
        const sensor_id = extractSensorTag(tags);

        if (temperature !== undefined) {
            await writeToInflux(influxDB, 'temperature', { sensor_id }, { temperature });
        }

        if (humidity !== undefined) {
            await writeToInflux(influxDB, 'humidity', { sensor_id }, { humidity });
        }

        res.json({ temperature, humidity, sensor_id });
    } catch (error) {
        console.error('Error processing DHT data:', error);
        sendError(res, 500, 'Failed to store measurements');
    }
});

export default router; 
