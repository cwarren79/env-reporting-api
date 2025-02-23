import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
let server;

const API_KEY = process.env.API_KEY || '1234567890';

describe('DHT Endpoint', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('POST /dht', () => {
        it('should return 401 without API key', (done) => {
            request(server)
                .post('/dht')
                .send({ tags: ['sensor:123'], temperature: 25 })
                .expect(401, done);
        });

        it('should return 400 if tags are missing', (done) => {
            request(server)
                .post('/dht')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({ temperature: 25, humidity: 60 })
                .expect(400, done);
        });

        it('should return 400 if temperature and humidity are missing', (done) => {
            request(server)
                .post('/dht')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({ tags: ['sensor:123'] })
                .expect(400, done);
        });

        it('should return 200 and store temperature and humidity', (done) => {
            request(server)
                .post('/dht')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({ tags: ['sensor:123'], temperature: 25, humidity: 60 })
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.property('temperature', 25);
                    expect(res.body).to.have.property('humidity', 60);
                    expect(res.body).to.have.property('sensor_id', '123');
                })
                .end(done);
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

        it('should return 500 when database write fails', (done) => {
            request(server)
                .post('/dht')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({
                    tags: ['sensor:123'],
                    temperature: 25
                })
                .expect(500)
                .expect((res) => {
                    expect(res.body).to.have.property('error', 'Failed to store measurements');
                })
                .end(done);
        });
    });

    describe('DHT Endpoint Tag Validation', () => {
        it('should return 400 for invalid sensor tag format', (done) => {
            request(server)
                .post('/dht')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({
                    tags: ['invalid:123'],
                    temperature: 25
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).to.equal('At least one sensor tag is required (format: sensor:id)');
                })
                .end(done);
        });
    });
}); 
