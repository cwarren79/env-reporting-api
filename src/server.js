import express from 'express';
import { InfluxDB, FieldType } from 'influx';

// Constants should be at the top
const DEFAULT_PORT = 3030;
const DEFAULT_INFLUX_PORT = 8086;

// Validate required environment variables
const requiredEnvVars = ['INFLUX_DB', 'INFLUX_HOST', 'API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const db = process.env.INFLUX_DB;
const host = process.env.INFLUX_HOST;

const influxDB = new InfluxDB({
  host: host,
  port: process.env.INFLUX_PORT || DEFAULT_INFLUX_PORT,
  database: db,
  schema: [
    {
      measurement: 'temperature',
      fields: {
        temperature: FieldType.INTEGER
      },
      tags: [
        'sensor_id'
      ]
    },
    {
      measurement: 'humidity',
      fields: {
        humidity: FieldType.INTEGER
      },
      tags: [
        'sensor_id'
      ]
    },
    {
      measurement: 'pm_ug_per_m3',
      fields: {
        '1.0um': FieldType.INTEGER,
        '2.5um': FieldType.INTEGER,
        '10um': FieldType.INTEGER
      },
      tags: [
        'sensor_id'
      ]
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
      tags: [
        'sensor_id'
      ]
    }
  ]
})

const app = express();

app.use(express.json());

const validateApiKey = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
};

// Simple validation helpers
const isNumber = (value) => typeof value === 'number' && !isNaN(value);
const isObject = (value) => typeof value === 'object' && value !== null;

// Validation middleware for DHT endpoint
const validateDHT = (req, res, next) => {
  const { tags, temperature, humidity } = req.body;

  // Validate tags
  if (!Array.isArray(tags) || !tags.length) {
    return res.status(400).json({ error: 'tags must be a non-empty array' });
  }

  // Validate at least one measurement is present
  if (temperature === undefined && humidity === undefined) {
    return res.status(400).json({ error: 'temperature or humidity is required' });
  }

  // Validate measurements if present
  if (temperature !== undefined && !isNumber(temperature)) {
    return res.status(400).json({ error: 'temperature must be a number' });
  }

  if (humidity !== undefined && !isNumber(humidity)) {
    return res.status(400).json({ error: 'humidity must be a number' });
  }

  next();
};

// Validation middleware for PMS endpoint
const validatePMS = (req, res, next) => {
  const { tags, pm_ug_per_m3, pm_per_1l_air } = req.body;

  // Validate tags
  if (!Array.isArray(tags) || !tags.length) {
    return res.status(400).json({ error: 'tags must be a non-empty array' });
  }

  // Validate at least one measurement is present
  if (!pm_ug_per_m3 && !pm_per_1l_air) {
    return res.status(400).json({ error: 'pm_ug_per_m3 or pm_per_1l_air is required' });
  }

  // Validate pm_ug_per_m3 if present
  if (pm_ug_per_m3 && (!isObject(pm_ug_per_m3) ||
      !isNumber(pm_ug_per_m3['1.0um']) ||
      !isNumber(pm_ug_per_m3['2.5um']) ||
      !isNumber(pm_ug_per_m3['10um']))) {
    return res.status(400).json({ error: 'invalid pm_ug_per_m3 format' });
  }

  // Validate pm_per_1l_air if present
  if (pm_per_1l_air && (!isObject(pm_per_1l_air) ||
      !isNumber(pm_per_1l_air['0.3um']) ||
      !isNumber(pm_per_1l_air['0.5um']) ||
      !isNumber(pm_per_1l_air['1.0um']) ||
      !isNumber(pm_per_1l_air['2.5um']) ||
      !isNumber(pm_per_1l_air['5.0um']) ||
      !isNumber(pm_per_1l_air['10um']))) {
    return res.status(400).json({ error: 'invalid pm_per_1l_air format' });
  }

  next();
};

app.get('/health', (req, res) => {
  console.log('Received GET request on the path /health');
  res.send('OK');
});

// Helper to safely escape values for InfluxQL
const escapeString = (str) => str.replace(/['"\\\x00-\x1f\x7f-\x9f]/g, '');

// Helper for consistent error responses
const sendError = (res, status, message) => {
  console.error(`Error: ${message}`);
  return res.status(status).json({ error: message });
};

// Helper for database operations
const writeToInflux = async (influx, measurement, tags, fields) => {
  try {
    await influx.writePoints([{ measurement, tags, fields }]);
    const query = `select * from ${measurement}
      where sensor_id = '${escapeString(tags.sensor_id)}'
      order by time desc
      limit 1`;
    const rows = await influx.query(query);
    return rows;
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    throw error;
  }
};

// Extract tag parsing logic
const extractSensorTag = (tags) => {
  const sensorTag = tags
    .map(tag => tag.split(':'))
    .find(([name]) => name === 'sensor');
  return sensorTag ? sensorTag[1] : '';
};

app.post('/dht', validateApiKey, validateDHT, async (req, res) => {
  try {
    const { tags, temperature, humidity } = req.body;
    const sensorTag = extractSensorTag(tags);

    if (!sensorTag) {
      return sendError(res, 400, 'Missing sensor tag');
    }

    const results = [];
    if (temperature !== undefined) {
      const result = await writeToInflux(influxDB, 'temperature',
        { sensor_id: sensorTag },
        { temperature });
      results.push(result);
    }

    if (humidity !== undefined) {
      const result = await writeToInflux(influxDB, 'humidity',
        { sensor_id: sensorTag },
        { humidity });
      results.push(result);
    }

    res.json({
      temperature,
      humidity,
      sensor_id: sensorTag
    });
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

app.post('/pms', validateApiKey, validatePMS, (req, res) => {
  console.log(req.body);

  if (!('tags' in req.body)) {
    res.sendStatus(400);
    return;
  }
  console.log('Tags:');
  let sensorTag = '';
  req.body.tags.forEach(tag => {
    const [tagName, tagValue] = tag.split(":");
    console.log(`  ${tagName} => ${tagValue}`)
    if (tagName === 'sensor') { sensorTag = tagValue; }
  })
  if (sensorTag === '') {
    res.sendStatus(400);
    return;
  }
  if (!('pm_ug_per_m3' in req.body) && !('pm_per_1l_air' in req.body)) {
    res.sendStatus(400);
    return;
  }

  if ('pm_ug_per_m3' in req.body) {
    influxDB.writePoints([
      {
        measurement: 'pm_ug_per_m3',
        tags: { sensor_id: sensorTag },
        fields: {
          '1.0um': req.body.pm_ug_per_m3['1.0um'],
          '2.5um': req.body.pm_ug_per_m3['2.5um'],
          '10um': req.body.pm_ug_per_m3['10um'],
        },
      }
    ]).then(() => {
      return influxDB.query(`
        select "1.0um" from pm_ug_per_m3
        where sensor_id = '${sensorTag}'
        order by time desc
        limit 1
      `)
    }).then(rows => {
      rows.forEach(row => console.log(`DB record: pm_ug_per_m3 for 1.0um is ${row['1.0um']}`))
    })
  }

  if ('pm_per_1l_air' in req.body) {
    influxDB.writePoints([
      {
        measurement: 'pm_per_1l_air',
        tags: { sensor_id: sensorTag },
        fields: {
          '0.3um': req.body.pm_per_1l_air['0.3um'],
          '0.5um': req.body.pm_per_1l_air['0.5um'],
          '1.0um': req.body.pm_per_1l_air['1.0um'],
          '2.5um': req.body.pm_per_1l_air['2.5um'],
          '5.0um': req.body.pm_per_1l_air['5.0um'],
          '10um': req.body.pm_per_1l_air['10um']
        },
      }
    ]).then(() => {
      return influxDB.query(`
        select "0.3um" from pm_per_1l_air
        where sensor_id = '${sensorTag}'
        order by time desc
        limit 1
        `)
    }).then(rows => {
      rows.forEach(row => console.log(`DB record: pm_per_1l_air for 0.3um is ${row['0.3um']}`))
    })
  }

  const responseData = {
    pm_ug_per_m3: req.body.pm_ug_per_m3,
    pm_per_1l_air: req.body.pm_per_1l_air,
    sensor_id: sensorTag
  }
  res.json(responseData);
});

// Database initialization
const initializeDatabase = async () => {
  try {
    const names = await influxDB.getDatabaseNames();
    if (!names.includes(db)) {
      await influxDB.createDatabase(db);
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Server initialization
const startServer = async () => {
  try {
    await initializeDatabase();
    const port = process.env.PORT || DEFAULT_PORT;
    const server = app.listen(port, () => {
      console.log(`Express server is listening on port ${port}`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

export const server = await startServer();
