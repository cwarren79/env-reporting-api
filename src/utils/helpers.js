// Common validation helpers
export const isNumber = (value) => typeof value === 'number' && !isNaN(value);
export const isObject = (value) => typeof value === 'object' && value !== null;

// Helper to escape special characters in InfluxDB queries
export const escapeString = (str) => str.replace(/([,"\s])/g, '\\$1');

// Helper for consistent error responses
export const sendError = (res, status, message) => {
    res.status(status).json({ error: message });
};

// Helper to write data points to InfluxDB
export const writeToInflux = async (influxDB, measurement, tags, fields) => {
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
export const extractSensorTag = (tags) => {
    const sensorTag = tags.find(tag => tag.startsWith('sensor:'));
    if (!sensorTag) {
        throw new Error('sensor tag not found');
    }
    return sensorTag.split(':')[1];
}; 
