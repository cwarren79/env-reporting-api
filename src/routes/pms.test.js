import request from 'supertest';
import { server } from '../server.js';
import { expect } from 'chai';

const API_KEY = process.env.API_KEY || '1234567890';

describe('PMS Endpoint', () => {
    describe('POST /pms', () => {
        it('should return 401 without API key', (done) => {
            request(server)
                .post('/pms')
                .send({
                    tags: ['sensor:123'],
                    pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
                })
                .expect(401, done);
        });

        it('should return 400 if tags are missing', (done) => {
            request(server)
                .post('/pms')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({ pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 } })
                .expect(400, done);
        });

        it('should return 400 if pm_ug_per_m3 and pm_per_1l_air are missing', (done) => {
            request(server)
                .post('/pms')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({ tags: ['sensor:123'] })
                .expect(400, done);
        });

        it('should return 200 and store pm_ug_per_m3 data', (done) => {
            request(server)
                .post('/pms')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({
                    tags: ['sensor:123'],
                    pm_ug_per_m3: { '1.0um': 10, '2.5um': 20, '10um': 30 }
                })
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
            request(server)
                .post('/pms')
                .set('Authorization', `Bearer ${API_KEY}`)
                .send({
                    tags: ['sensor:123'],
                    pm_per_1l_air: {
                        '0.3um': 5, '0.5um': 10, '1.0um': 15,
                        '2.5um': 20, '5.0um': 25, '10um': 30
                    }
                })
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
    });
}); 
