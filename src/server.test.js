import request from 'supertest';
import { app } from './server';

describe('/health endpoint functionality', () => {
	it('replies with OK when a GET request is sent', (done) => {
		request(app)
			.get('/health')
			.expect(/^OK$/, done);
	});
});

describe('/environment endpoint functionality', () => {
	it('responds with status code 200 when a POST request is sent with all parameters', (done) => {
    const payload = {temperature: 22, humidity: 45, tags: ["sensor:1234"]};
		request(app)
			.post('/environment')
      .send(payload)
      .set('Content-Type', 'application/json')
			.expect(200, done)
	});

	it('responds with status code 200 when a POST request is sent with no humidity parameter', (done) => {
    const payload = {temperature: 22, tags: ["sensor:1234"]};
		request(app)
			.post('/environment')
      .send(payload)
      .set('Content-Type', 'application/json')
			.expect(200, done)
	});

	it('responds with status code 200 when a POST request is sent with no temperature parameter', (done) => {
    const payload = {humidity: 45, tags: ["sensor:1234"]};
		request(app)
			.post('/environment')
      .send(payload)
      .set('Content-Type', 'application/json')
			.expect(200, done)
	});

	it('responds with status code 400 when a POST request is sent with no tags parameter', (done) => {
    const payload = {temperature: 22, humidity: 45};
		request(app)
			.post('/environment')
      .send(payload)
      .set('Content-Type', 'application/json')
			.expect(400, done)
	});

  it('responds with status code 400 when the tags parameter does not contain a sensor key', (done) => {
    const payload = {temperature: 22, humidity: 45, tags: ["somethingelse:1234"]};
    request(app)
      .post('/environment')
      .send(payload)
      .set('Content-Type', 'application/json')
      .expect(400, done)
  });
});
