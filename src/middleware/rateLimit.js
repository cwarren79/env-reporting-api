import rateLimit from 'express-rate-limit';

export const config = {
    windowMs: 60 * 1000, // 1 minute window
    max: 70 // 70 requests per minute
};

export const limiter = rateLimit({
    ...config,
    message: 'Too many requests from this IP, please try again later'
});
