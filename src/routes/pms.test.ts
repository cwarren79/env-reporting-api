import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { PMSSensor } from '../schemas/sensors.js';
import { Server } from 'http';

let server: Server;

const API_KEY = process.env.API_KEY || '1234567890';

describe('PMS Endpoint', () => {
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

    describe('POST /pms', () => {
        it('should return 401 without API key', async () => {
            const response = await request(server)
                .post('/pms')
                .send({
                    tags: ['sensor:123'],
                    pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
                } as PMSSensor);

            expect(response.status).to.equal(401);
        });

        it('should return 400 if tags are missing', async () => {
            const response = await request(server)
                .post('/pms')
                .set('X-API-Key', API_KEY)
                .send({ pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }} as PMSSensor);

            expect(response.status).to.equal(400);
        });

        it('should return 400 if pm_ug_per_m3 and pm_per_1l_air are missing', async () => {
            const response = await request(server)
                .post('/pms')
                .set('X-API-Key', API_KEY)
                .send({ tags: ['sensor:123'] } as PMSSensor);

            expect(response.status).to.equal(400);
        });

        it('should return 200 and store pm_ug_per_m3 data', async () => {
            const response = await request(server)
                .post('/pms')
                .set('X-API-Key', API_KEY)
                .send({
                    tags: ['sensor:123'],
                    pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
                } as PMSSensor);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('pm_ug_per_m3');
            expect(response.body.pm_ug_per_m3).to.have.property('1.0um', 10);
            expect(response.body.pm_ug_per_m3).to.have.property('2.5um', 20);
            expect(response.body.pm_ug_per_m3).to.have.property('10um', 30);
            expect(response.body).to.have.property('sensor_id', '123');
        });

        it('should return 200 and store pm_per_1l_air data', async () => {
            const response = await request(server)
                .post('/pms')
                .set('X-API-Key', API_KEY)
                .send({
                    tags: ['sensor:123'],
                    pm_per_1l_air: {
                        '0.3um': 5, '0.5um': 10, '1.0um': 15,
                        '2.5um': 20, '5.0um': 25, '10um': 30
                    }
                } as PMSSensor);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('pm_per_1l_air');
            expect(response.body.pm_per_1l_air).to.have.property('0.3um', 5);
            expect(response.body.pm_per_1l_air).to.have.property('0.5um', 10);
            expect(response.body.pm_per_1l_air).to.have.property('1.0um', 15);
            expect(response.body.pm_per_1l_air).to.have.property('2.5um', 20);
            expect(response.body.pm_per_1l_air).to.have.property('5.0um', 25);
            expect(response.body.pm_per_1l_air).to.have.property('10um', 30);
            expect(response.body).to.have.property('sensor_id', '123');
        });

        it('should reject non-numeric values', async () => {
            const response = await request(server)
                .post('/pms')
                .set('X-API-Key', API_KEY)
                .send({
                    tags: ['sensor:123'],
                    pm_ug_per_m3: {
                        '1.0um': 'invalid',
                        '2.5um': 20,
                        '10um': 30
                    }
                } as unknown as PMSSensor);

            expect(response.status).to.equal(400);
            expect(response.body.error).to.include('number');
        });
    });
});
