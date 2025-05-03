import { config } from './rateLimit.js';
import { expect } from 'chai';

describe('Rate Limiter Configuration', () => {
    it('should be configured with correct window and limit', () => {
        expect(config.windowMs).to.equal(60 * 1000); // 1 minute in milliseconds
        expect(config.max).to.equal(70); // 70 requests per minute
    });
});
