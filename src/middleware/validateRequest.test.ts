import { expect } from 'chai';
import { z } from 'zod';
import { validateRequest } from './validateRequest.js';

describe('validateRequest Middleware', () => {
    const testSchema = z.object({
        name: z.string(),
        age: z.number()
    });

    const middleware = validateRequest(testSchema);

    it('should call next() for valid request body', async () => {
        const req = {
            body: {
                name: 'John',
                age: 30
            }
        };
        const res = {};
        let nextCalled = false;
        const next = () => { nextCalled = true; };

        await middleware(req as any, res as any, next);

        expect(nextCalled).to.be.true;
    });

    it('should return 400 for invalid request body', async () => {
        const req = {
            body: {
                name: 'John',
                age: 'not a number'
            }
        };
        const res = {
            status: (code: number) => {
                expect(code).to.equal(400);
                return res;
            },
            json: (body: any) => {
                expect(body.error).to.be.a('string');
            }
        };
        const next = () => {};

        await middleware(req as any, res as any, next);
    });

    it('should return 400 for missing required fields', async () => {
        const req = {
            body: {
                name: 'John'
            }
        };
        const res = {
            status: (code: number) => {
                expect(code).to.equal(400);
                return res;
            },
            json: (body: any) => {
                expect(body.error).to.be.a('string');
            }
        };
        const next = () => {};

        await middleware(req as any, res as any, next);
    });
});
