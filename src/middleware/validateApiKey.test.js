import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';

let server;
const API_KEY = process.env.API_KEY || '1234567890';

describe('API Key Validation', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    it('should reject requests without API key', (done) => {
        request(server)
            .post('/dht')
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('API key is required');
            })
            .end(done);
    });

    it('should reject invalid API key', (done) => {
        request(server)
            .post('/dht')
            .set('X-API-Key', 'invalid-key')
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('Invalid API key');
            })
            .end(done);
    });
});
