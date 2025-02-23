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
