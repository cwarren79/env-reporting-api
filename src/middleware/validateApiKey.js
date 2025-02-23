import { config } from '../config/env.js';
import { sendError } from '../utils/helpers.js';

export const validateApiKey = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Bearer token is required');
    }

    const token = authHeader.split(' ')[1];
    if (token !== config.apiKey) {
        return sendError(res, 401, 'Invalid token');
    }

    next();
}; 
