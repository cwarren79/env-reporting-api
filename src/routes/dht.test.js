import request from 'supertest';
import { server } from '../server.js';
import { expect } from 'chai';

const API_KEY = process.env.API_KEY || '1234567890';

describe('DHT Endpoint', () => {
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
}); 
