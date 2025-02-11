import express from 'express';
import { influxDB } from '../config/database.js';
import { isNumber, isObject, sendError, writeToInflux, extractSensorTag } from '../utils/helpers.js';

const router = express.Router();

// Validation middleware for PMS endpoint
export const validatePMS = (req, res, next) => {
    const { tags, pm_ug_per_m3, pm_per_1l_air } = req.body;

    // Validate tags
    if (!Array.isArray(tags) || !tags.length) {
        return sendError(res, 400, 'tags must be a non-empty array');
    }

    // Validate at least one measurement is present
    if (!pm_ug_per_m3 && !pm_per_1l_air) {
        return sendError(res, 400, 'pm_ug_per_m3 or pm_per_1l_air is required');
    }

    // Validate pm_ug_per_m3 if present
    if (pm_ug_per_m3) {
        if (!isObject(pm_ug_per_m3)) {
            return sendError(res, 400, 'pm_ug_per_m3 must be an object');
        }

        const requiredFields = ['1.0um', '2.5um', '10um'];
        for (const field of requiredFields) {
            if (!isNumber(pm_ug_per_m3[field])) {
                return sendError(res, 400, `pm_ug_per_m3.${field} must be a number`);
            }
        }
    }

    // Validate pm_per_1l_air if present
    if (pm_per_1l_air) {
        if (!isObject(pm_per_1l_air)) {
            return sendError(res, 400, 'pm_per_1l_air must be an object');
        }

        const requiredFields = ['0.3um', '0.5um', '1.0um', '2.5um', '5.0um', '10um'];
        for (const field of requiredFields) {
            if (!isNumber(pm_per_1l_air[field])) {
                return sendError(res, 400, `pm_per_1l_air.${field} must be a number`);
            }
        }
    }

    next();
};

router.post('/', validatePMS, async (req, res) => {
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
