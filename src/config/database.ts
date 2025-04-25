import { InfluxDB, FieldType, ISchemaOptions } from 'influx';
import { config } from './env.js';

// We use ISchemaOptions directly since tag validation is handled by Zod schemas
// See: src/schemas/sensors.ts for the validation logic
// Note: Zod ensures that sensor_id is properly formatted (starts with 'sensor:')
const schema: ISchemaOptions[] = [
    {
        measurement: 'temperature',
        fields: {
            temperature: FieldType.INTEGER
        },
        tags: ['sensor_id']
    },
    {
        measurement: 'humidity',
        fields: {
            humidity: FieldType.INTEGER
        },
        tags: ['sensor_id']
    },
    {
        measurement: 'pm_ug_per_m3',
        fields: {
            '1.0um': FieldType.INTEGER,
            '2.5um': FieldType.INTEGER,
            '10um': FieldType.INTEGER
        },
        tags: ['sensor_id']
    },
    {
        measurement: 'pm_per_1l_air',
        fields: {
            '0.3um': FieldType.INTEGER,
            '0.5um': FieldType.INTEGER,
            '1.0um': FieldType.INTEGER,
            '2.5um': FieldType.INTEGER,
            '5.0um': FieldType.INTEGER,
            '10um': FieldType.INTEGER
        },
        tags: ['sensor_id']
    }
];

interface InfluxConfig {
    host: string;
    port: number;
    database: string;
    schema: ISchemaOptions[];
}

export const influxConfig: InfluxConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    schema
};

const influxDB = new InfluxDB(influxConfig);

// Database initialization
const initializeDatabase = async (): Promise<void> => {
    try {
        const names = await influxDB.getDatabaseNames();
        if (!names.includes(config.database.name)) {
            await influxDB.createDatabase(config.database.name);
        }
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

export { influxDB, initializeDatabase }; 
