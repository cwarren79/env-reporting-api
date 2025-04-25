import { expect } from 'chai';
import sinon from 'sinon';
import { influxDB, initializeDatabase, influxConfig } from './database.js';
import { config } from './env.js';

describe('Database Configuration', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be configured with correct settings', () => {
        expect(influxConfig).to.deep.include({
            host: config.database.host,
            port: config.database.port,
            database: config.database.name
        });
    });

    it('should have correct schema for all measurements', () => {
        const measurements = influxConfig.schema.map(s => s.measurement);
        expect(measurements).to.deep.equal([
            'temperature',
            'humidity',
            'pm_ug_per_m3',
            'pm_per_1l_air'
        ]);
    });

    it('should require sensor_id tag for all measurements', () => {
        influxConfig.schema.forEach(s => {
            expect(s.tags).to.include('sensor_id');
        });
    });

    describe('initializeDatabase', () => {
        it('should create database if it does not exist', async () => {
            const getDatabaseNamesStub = sandbox.stub(influxDB, 'getDatabaseNames')
                .resolves(['other_db']);
            const createDatabaseStub = sandbox.stub(influxDB, 'createDatabase')
                .resolves();

            await initializeDatabase();

            sinon.assert.calledOnce(getDatabaseNamesStub);
            sinon.assert.calledWith(createDatabaseStub, config.database.name);
        });

        it('should not create database if it already exists', async () => {
            const getDatabaseNamesStub = sandbox.stub(influxDB, 'getDatabaseNames')
                .resolves([config.database.name]);
            const createDatabaseStub = sandbox.stub(influxDB, 'createDatabase')
                .resolves();

            await initializeDatabase();

            sinon.assert.calledOnce(getDatabaseNamesStub);
            sinon.assert.notCalled(createDatabaseStub);
        });

        it('should handle initialization errors', async () => {
            const consoleErrorStub = sandbox.stub(console, 'error');
            const processExitStub = sandbox.stub(process, 'exit');

            sandbox.stub(influxDB, 'getDatabaseNames')
                .rejects(new Error('Connection failed'));

            await initializeDatabase();

            sinon.assert.calledWith(consoleErrorStub,
                'Failed to initialize database:',
                sinon.match.instanceOf(Error)
            );
            sinon.assert.calledWith(processExitStub, 1);
        });
    });
}); 
