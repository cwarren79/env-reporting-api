import { sendError } from '../utils/helpers.js';

export const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error.errors) {
            return sendError(res, 400, error.errors[0].message);
        }
        return sendError(res, 400, 'Invalid request body');
    }
}; 
