import express, { Request, Response } from 'express';
import { influxDB } from '../config/database.js';
import { sendError, writeToInflux, extractSensorTag } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { dhtSchema, DHTSensor } from '../schemas/sensors.js';

const router = express.Router();

interface DHTResponse {
    temperature?: number;
    humidity?: number;
    sensor_id: string;
}

router.post('/', validateRequest(dhtSchema), async (req: Request<{}, {}, DHTSensor>, res: Response<DHTResponse | { error: string }>) => {
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
