import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateHmacSignature = (body = '') => {
    const stringBody = JSON.stringify(body);
    return crypto
        .createHmac('sha256', config.signingSecret)
        .update(stringBody)
        .digest('hex');
};
