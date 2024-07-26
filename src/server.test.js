import request from 'supertest';
import { server } from './server';

describe('/health endpoint functionality', () => {
	it('replies with OK when a GET request is sent', (done) => {
		request(server)
			.get('/health')
			.expect(/^OK$/, done);
	});
});

describe('/dht endpoint functionality', () => {
	// after((done) => {
	// 	server.close(done);
	// });
	it('responds with status code 200 when a POST request is sent with all parameters', (done) => {
		const payload = { temperature: 22, humidity: 45, tags: ["sensor:1234"] };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with all parameters in different order', (done) => {
		const payload = { "tags": ["sensor:1234"], "temperature": 22, "humidity": 45 };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with no humidity parameter', (done) => {
		const payload = { temperature: 22, tags: ["sensor:1234"] };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with no temperature parameter', (done) => {
		const payload = { humidity: 45, tags: ["sensor:1234"] };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 400 when a POST request is sent with no temperature or humidity parameter', (done) => {
		const payload = { tags: ["sensor:1234"] };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done)
	});

	it('responds with status code 400 when a POST request is sent with no tags parameter', (done) => {
		const payload = { temperature: 22, humidity: 45 };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done);
	});

	it('responds with status code 400 when the tags parameter does not contain a sensor key', (done) => {
		const payload = { temperature: 22, humidity: 45, tags: ["somethingelse:1234"] };
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done);
	});
});

describe('/pms endpoint functionality', () => {
	after((done) => {
		server.close(done);
	});

	it('responds with status code 200 when a POST request is sent with all parameters', (done) => {
		const payload = {
			pm_ug_per_m3: { '1.0um': 1, '2.5um': 2, '10um': 3 },
			pm_per_1l_air: { '0.3um': 1, '0.5um': 2, '1.0um': 3, '2.5um': 4, '5.0um': 5, '10um': 6 },
			tags: ["sensor:1234"]
		};
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with all parameters in different order', (done) => {
		const payload = {
			tags: ["sensor:1234"],
			pm_ug_per_m3: { '2.5um': 2, '1.0um': 1, '10um': 3 },
			pm_per_1l_air: { '1.0um': 3, '0.3um': 1, '2.5um': 4, '5.0um': 5, '10um': 6, '0.5um': 2 },
		};
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with no pm_per_1l_air parameter', (done) => {
		const payload = {
			pm_ug_per_m3: { '1.0um': 1, '2.5um': 2, '10um': 3 },
			tags: ["sensor:1234"]
		};
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 200 when a POST request is sent with no pm_ug_per_m3 parameter', (done) => {
		const payload = {
			pm_per_1l_air: { '0.3um': 1, '0.5um': 2, '1.0um': 3, '2.5um': 4, '5.0um': 5, '10um': 6 },
			tags: ["sensor:1234"]
		};
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(200, done);
	});

	it('responds with status code 400 when a POST request is sent with no pm_ug_per_m3 or pm_per_1l_air parameter', (done) => {
		const payload = { tags: ["sensor:1234"] };
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done)
	});

	it('responds with status code 400 when a POST request is sent with no tags parameter', (done) => {
		const payload = {
			pm_ug_per_m3: { '1.0um': 1, '2.5um': 2, '10um': 3 },
			pm_per_1l_air: { '0.3um': 1, '0.5um': 2, '1.0um': 3, '2.5um': 4, '5.0um': 5, '10um': 6 }
		};
		request(server)
			.post('/pms')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done);
	});

	it('responds with status code 400 when the tags parameter does not contain a sensor key', (done) => {
		const payload = {
			pm_ug_per_m3: { '1.0um': 1, '2.5um': 2, '10um': 3 },
			pm_per_1l_air: { '0.3um': 1, '0.5um': 2, '1.0um': 3, '2.5um': 4, '5.0um': 5, '10um': 6 },
			tags: ["somethingelse:1234"]
		};
		request(server)
			.post('/dht')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(400, done);
	});
});
