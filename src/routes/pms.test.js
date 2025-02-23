import request from 'supertest';
import { startServer } from '../server.js';
import { expect } from 'chai';
import { generateHmacSignature } from '../utils/testHelpers.js';

let server;

describe('PMS Endpoint', () => {
    before(async () => {
        server = await startServer();
    });

    after(() => {
        server.close();
    });

    describe('POST /pms', () => {
        it('should return 401 without HMAC signature', (done) => {
            const body = {
                tags: ['sensor:123'],
                pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
            };
            request(server)
                .post('/pms')
                .send(body)
                .expect(401, done);
        });

        it('should return 400 if tags are missing', (done) => {
            const body = {
                pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
            };
            request(server)
                .post('/pms')
                .set('Authorization', `HMAC ${generateHmacSignature(body)}`)
                .send(body)
                .expect(400, done);
        });

        it('should return 400 if pm_ug_per_m3 and pm_per_1l_air are missing', (done) => {
            const body = {
                tags: ['sensor:123']
            };
            request(server)
                .post('/pms')
                .set('Authorization', `HMAC ${generateHmacSignature(body)}`)
                .send(body)
                .expect(400, done);
        });

        it('should return 200 and store pm_ug_per_m3 data', (done) => {
            const body = {
                tags: ['sensor:123'],
                pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
            };
            request(server)
                .post('/pms')
                .set('Authorization', `HMAC ${generateHmacSignature(body)}`)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.property('pm_ug_per_m3');
                    expect(res.body.pm_ug_per_m3).to.have.property('1.0um', 10);
                    expect(res.body.pm_ug_per_m3).to.have.property('2.5um', 20);
                    expect(res.body.pm_ug_per_m3).to.have.property('10um', 30);
                    expect(res.body).to.have.property('sensor_id', '123');
                })
                .end(done);
        });

        it('should return 200 and store pm_per_1l_air data', (done) => {
            const body = {
                tags: ['sensor:123'],
                pm_per_1l_air: {
                    '0.3um': 5, '0.5um': 10, '1.0um': 15,
                    '2.5um': 20, '5.0um': 25, '10um': 30
                }
            };
            request(server)
                .post('/pms')
                .set('Authorization', `HMAC ${generateHmacSignature(body)}`)
                .send(body)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.property('pm_per_1l_air');
                    expect(res.body.pm_per_1l_air).to.have.property('0.3um', 5);
                    expect(res.body.pm_per_1l_air).to.have.property('0.5um', 10);
                    expect(res.body.pm_per_1l_air).to.have.property('1.0um', 15);
                    expect(res.body.pm_per_1l_air).to.have.property('2.5um', 20);
                    expect(res.body.pm_per_1l_air).to.have.property('5.0um', 25);
                    expect(res.body.pm_per_1l_air).to.have.property('10um', 30);
                    expect(res.body).to.have.property('sensor_id', '123');
                })
                .end(done);
        });

        it('should reject non-numeric values', (done) => {
            const body = {
                tags: ['sensor:123'],
                pm_ug_per_m3: {
                    '1.0um': 'invalid',
                    '2.5um': 20,
                    '10um': 30
                }
            };
            request(server)
                .post('/pms')
                .set('Authorization', `HMAC ${generateHmacSignature(body)}`)
                .send(body)
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).to.include('number');
                })
                .end(done);
        });

        it('should return 401 with invalid HMAC signature', (done) => {
            const body = {
                tags: ['sensor:123'],
                pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
            };
            request(server)
                .post('/pms')
                .set('Authorization', 'HMAC invalid_signature')
                .send(body)
                .expect(401, done);
        });
    });
});
