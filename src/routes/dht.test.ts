import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { Server } from 'http';
import { DHTSensor } from '../schemas/sensors.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
let server: Server;
const API_KEY = process.env.API_KEY || '1234567890';

describe('DHT Endpoint', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('POST /dht', () => {
        it('should return 401 without API key', async () => {
            const response = await request(server)
                .post('/dht')
                .send({ tags: ['sensor:123'], temperature: 25 } as DHTSensor);
            expect(response.status).to.equal(401);
        });

        it('should return 400 if tags are missing', async () => {
            const response = await request(server)
                .post('/dht')
                .set('X-API-Key', API_KEY)
                .send({ temperature: 25, humidity: 60 });
            expect(response.status).to.equal(400);
        });

        it('should return 400 if temperature and humidity are missing', async () => {
            const response = await request(server)
                .post('/dht')
                .set('X-API-Key', API_KEY)
                .send({ tags: ['sensor:123'] } as DHTSensor);
            expect(response.status).to.equal(400);
        });

        it('should return 200 and store temperature and humidity', async () => {
            const response = await request(server)
                .post('/dht')
                .set('X-API-Key', API_KEY)
                .send({ tags: ['sensor:123'], temperature: 25, humidity: 60 } as DHTSensor);

            expect(response.status).to.equal(200);
            const body = response.body as Omit<DHTSensor, 'tags'> & { sensor_id: string };
            expect(body.temperature).to.equal(25);
            expect(body.humidity).to.equal(60);
            expect(body.sensor_id).to.equal('123');
        });
    });

    describe('DHT Endpoint Error Handling', () => {
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

        it('should return 500 when database write fails', async () => {
            const response = await request(server)
                .post('/dht')
                .set('X-API-Key', API_KEY)
                .send({
                    tags: ['sensor:123'],
                    temperature: 25
                } as DHTSensor);

            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('error', 'Failed to store measurements');
        });
    });

    describe('DHT Endpoint Tag Validation', () => {
        it('should return 400 for invalid sensor tag format', async () => {
            const response = await request(server)
                .post('/dht')
                .set('X-API-Key', API_KEY)
                .send({
                    tags: ['invalid:123'],
                    temperature: 25
                } as DHTSensor);

            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('At least one sensor tag is required (format: sensor:id)');
        });
    });
});
