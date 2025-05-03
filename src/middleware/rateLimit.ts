import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
    windowMs: number;
    max: number;
}

export const config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute window
    max: 70 // 70 requests per minute
};

export const limiter = rateLimit({
    ...config,
    message: 'Too many requests from this IP, please try again later'
});
