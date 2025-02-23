import { config } from '../config/env.js';
import { sendError } from '../utils/helpers.js';
import crypto from 'crypto';

export const validateApiKey = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('HMAC ')) {
        return sendError(res, 401, 'HMAC signature is required');
    }

    const signature = authHeader.split(' ')[1];

    // Calculate HMAC of request body
    const body = req.body ? JSON.stringify(req.body) : '';
    const expectedSignature = crypto
        .createHmac('sha256', config.apiKey)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        return sendError(res, 401, 'Invalid signature');
    }

    next();
};
