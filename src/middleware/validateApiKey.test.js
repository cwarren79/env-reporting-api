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

    it('should reject malformed bearer token', (done) => {
        request(server)
            .post('/dht')
            .set('Authorization', 'Bearer')
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('Bearer token is required');
            })
            .end(done);
    });

    it('should reject token with wrong prefix', (done) => {
        request(server)
            .post('/dht')
            .set('Authorization', `Token ${API_KEY}`)
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('Bearer token is required');
            })
            .end(done);
    });
}); 
