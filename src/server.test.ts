import { expect } from 'chai';
import request from 'supertest';
import { startServer } from './server.js';
import { Server } from 'http';
import sinon from 'sinon';
import logger from './config/logger.js';

describe('Server', () => {
    let server: Server;
    let sandbox: sinon.SinonSandbox;

    before(async () => {
        server = await startServer();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    after(() => {
        server.close();
    });

    describe('Request Logging', () => {
        it('should log successful requests', async () => {
            const loggerInfoStub = sandbox.stub(logger, 'info');

            await request(server)
                .get('/health')
                .expect(200);

            sinon.assert.calledWith(loggerInfoStub, sinon.match.string);
            const logMessage = loggerInfoStub.firstCall.args[0];
            expect(logMessage).to.include('GET /health');
            expect(logMessage).to.include('200');
        });

        it('should log failed requests', async () => {
            const loggerInfoStub = sandbox.stub(logger, 'info');

            await request(server)
                .post('/health')
                .expect(404);

            sinon.assert.calledWith(loggerInfoStub, sinon.match.string);
            const logMessage = loggerInfoStub.firstCall.args[0];
            expect(logMessage).to.include('POST /health');
            expect(logMessage).to.include('404');
        });

        it('should log requests with query parameters', async () => {
            const loggerInfoStub = sandbox.stub(logger, 'info');

            await request(server)
                .get('/health?test=123')
                .expect(200);

            sinon.assert.calledWith(loggerInfoStub, sinon.match.string);
            const logMessage = loggerInfoStub.firstCall.args[0];
            expect(logMessage).to.include('GET /health?test=123');
        });
    });
});
