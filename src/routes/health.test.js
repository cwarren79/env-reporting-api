import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';

let server;

describe('Health Endpoint', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('GET /health', () => {
        it('should return OK', (done) => {
            request(server)
                .get('/health')
                .expect(200)
                .expect('OK', done);
        });

        it('should return 200 with correct content type', (done) => {
            request(server)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });

        it('should not accept POST requests', (done) => {
            request(server)
                .post('/health')
                .expect(404, done);
        });
    });
}); 
