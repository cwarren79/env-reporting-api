import { exec } from 'child_process';
import { promisify } from 'util';
import { Response } from 'express';
import { InfluxDB } from 'influx';

// Helper to escape special characters in InfluxDB queries
export const escapeString = (str: string): string => str.replace(/([,"\s])/g, '\\$1');

// Helper for consistent error responses
export const sendError = (res: Response, status: number, message: string): void => {
    res.status(status).json({ error: message });
};

interface InfluxPoint {
    measurement: string;
    tags: Record<string, string>;
    fields: Record<string, any>;
    timestamp: Date;
}

// Helper to write data points to InfluxDB
export const writeToInflux = async (
    influxDB: InfluxDB,
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, any>
): Promise<void> => {
    try {
        await influxDB.writePoints([
            {
                measurement,
                tags,
                fields,
                timestamp: new Date()
            }
        ]);
    } catch (error) {
        console.error(`Error writing to InfluxDB (${measurement}):`, error);
        throw error;
    }
};

// Helper to extract sensor ID from tags array
export const extractSensorTag = (tags: string[]): string => {
    if (!Array.isArray(tags)) {
        throw new Error('tags must be an array');
    }
    const sensorTag = tags.find(tag =>
        typeof tag === 'string' && tag.startsWith('sensor:')
    );
    if (!sensorTag) {
        throw new Error('sensor tag not found');
    }
    const [prefix, id] = sensorTag.split(':');
    if (!id) {
        throw new Error('invalid sensor tag format');
    }
    return id;
};

// Promisify exec for async/await usage
export const execAsync = promisify(exec);
