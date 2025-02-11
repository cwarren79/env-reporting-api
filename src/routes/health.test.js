import request from 'supertest';
import { server } from '../server.js';
import { expect } from 'chai';

describe('Health Endpoint', () => {
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
    });
}); 
