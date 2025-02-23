import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';

let server;

describe('HMAC Validation', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    it('should reject request with malformed authorization header', (done) => {
        request(server)
            .post('/dht')
            .set('Authorization', 'malformed')
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('HMAC signature is required');
            })
            .end(done);
    });

    it('should reject request with incorrect authorization prefix', (done) => {
        request(server)
            .post('/dht')
            .set('Authorization', 'Bearer abc123')
            .expect(401)
            .expect((res) => {
                expect(res.body.error).to.equal('HMAC signature is required');
            })
            .end(done);
    });
});
