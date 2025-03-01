import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { execAsync } from '../utils/helpers.js';

describe('Health Endpoint', () => {
    let server;

    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('GET /health', () => {
        it('should return healthy status when all systems are up', async () => {
            const res = await request(server)
                .get('/health')
                .expect(200);

            expect(res.body).to.have.property('status', 'healthy');
            expect(res.body).to.have.property('database', 'connected');
            expect(res.body).to.have.property('uptime').that.is.a('number');
            expect(res.body).to.have.property('timestamp').that.is.a('string');
        });

        describe('Database Failure', () => {
            before(async () => {
                // Stop the database container
                await execAsync('docker stop influxdb-test');
            });

            after(async () => {
                // Restart the database container
                await execAsync('docker start influxdb-test');
                // Give it a moment to start up
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            it('should return unhealthy status when database is down', async () => {
                const res = await request(server)
                    .get('/health')
                    .expect(503);

                expect(res.body).to.have.property('status', 'unhealthy');
                expect(res.body).to.have.property('database', 'disconnected');
                expect(res.body).to.have.property('error').that.is.a('string');
                expect(res.body).to.have.property('timestamp').that.is.a('string');
            });
        });

        it('should not accept POST requests', (done) => {
            request(server)
                .post('/health')
                .expect(404, done);
        });
    });
});
