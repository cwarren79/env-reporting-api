import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { Server } from 'http';

let server: Server;
const API_KEY = process.env.API_KEY || '1234567890';

describe('API Key Validation', () => {
    before(async () => {
        const app = await startServer();
        if (!app.listening) {
            server = app.listen();
        } else {
            server = app;
        }
    });

    after(() => {
        if (server.listening) {
            server.close();
        }
    });

    it('should reject requests without API key', async () => {
        const response = await request(server)
            .post('/dht')
            .expect(401);

        expect(response.body.error).to.equal('API key is required');
    });

    it('should reject invalid API key', async () => {
        const response = await request(server)
            .post('/dht')
            .set('X-API-Key', 'invalid-key')
            .expect(401);

        expect(response.body.error).to.equal('Invalid API key');
    });
});
