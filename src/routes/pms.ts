import express, { Request, Response } from 'express';
import { influxDB } from '../config/database.js';
import { sendError, writeToInflux, extractSensorTag } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { pmsSchema, PMSSensor, PMUgPerM3, PMPer1LAir } from '../schemas/sensors.js';

const router = express.Router();

interface PMSResponse {
    pm_ug_per_m3?: PMUgPerM3;
    pm_per_1l_air?: PMPer1LAir;
    sensor_id: string;
}

router.post('/', validateRequest(pmsSchema), async (req: Request<{}, {}, PMSSensor>, res: Response<PMSResponse | { error: string }>) => {
    const { tags, pm_ug_per_m3, pm_per_1l_air } = req.body;

    try {
        const sensor_id = extractSensorTag(tags);

        if (pm_ug_per_m3) {
            await writeToInflux(influxDB, 'pm_ug_per_m3', { sensor_id }, pm_ug_per_m3);
        }

        if (pm_per_1l_air) {
            await writeToInflux(influxDB, 'pm_per_1l_air', { sensor_id }, pm_per_1l_air);
        }

        res.json({ pm_ug_per_m3, pm_per_1l_air, sensor_id });
    } catch (error) {
        console.error('Error processing PMS data:', error);
        sendError(res, 500, 'Failed to store measurements');
    }
});

export default router;
