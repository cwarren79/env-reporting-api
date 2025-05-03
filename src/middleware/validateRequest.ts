import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/helpers.js';

export const validateRequest = <T extends z.ZodType>(schema: T) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return sendError(res, 400, error.errors[0].message);
            }
            return sendError(res, 400, 'Invalid request body');
        }
    };
