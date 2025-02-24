import { config } from '../config/env.js';
import { sendError } from '../utils/helpers.js';

export const validateApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
        return sendError(res, 401, 'API key is required');
    }

    if (apiKey !== config.apiKey) {
        return sendError(res, 401, 'Invalid API key');
    }

    next();
};
