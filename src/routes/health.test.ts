import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { execAsync } from '../utils/helpers.js';
import { Server } from 'http';
import { HealthResponse } from './health.js';

let server: Server;

describe('Health Endpoint', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('GET /health', () => {
        it('should return healthy status when all systems are up', async () => {
            const response = await request(server)
                .get('/health');

            expect(response.status).to.equal(200);
            const body = response.body as HealthResponse;
            expect(body.status).to.equal('healthy');
            expect(body.database).to.equal('connected');
            expect(body.uptime).to.be.a('number');
            expect(body.timestamp).to.be.a('string');
        });

        it('should not accept POST requests', async () => {
            const response = await request(server)
                .post('/health');

            expect(response.status).to.equal(404);
        });
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
            const response = await request(server)
                .get('/health');

            expect(response.status).to.equal(503);
            const body = response.body as HealthResponse;
            expect(body.status).to.equal('unhealthy');
            expect(body.database).to.equal('disconnected');
            expect(body.error).to.be.a('string');
            expect(body.timestamp).to.be.a('string');
        });
    });
});
