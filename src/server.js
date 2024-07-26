import express from 'express';
import { InfluxDB, FieldType } from 'influx';

const db = process.env.INFLUX_DB
const host = process.env.INFLUX_HOST

const influxDB = new InfluxDB({
  host: host,
  port: 8086,
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

app.get('/health', (req, res) => {
  console.log('Received GET request on the path /health');
  res.send('OK');
});

app.post('/dht', (req, res) => {
  console.log(req.body);
  console.log(`Temperature: ${req.body.temperature}`);
  console.log(`Humidity: ${req.body.humidity}`);
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
  if (!('temperature' in req.body) && !('humidity' in req.body)) {
    res.sendStatus(400);
    return;
  }
  if ('temperature' in req.body) {
    influxDB.writePoints([
      {
        measurement: 'temperature',
        tags: { sensor_id: sensorTag },
        fields: { 'temperature': req.body.temperature },
      }
    ]).then(() => {
      return influxDB.query(`
        select * from temperature
        where sensor_id = '${sensorTag}'
        order by time desc
        limit 1
      `)
    }).then(rows => {
      rows.forEach(row => console.log(`DB record: temperature is ${row.temperature} C`))
    })
  }
  if ('humidity' in req.body) {
    influxDB.writePoints([
      {
        measurement: 'humidity',
        tags: { sensor_id: sensorTag },
        fields: { humidity: req.body.humidity },
      }
    ]).then(() => {
      return influxDB.query(`
        select * from humidity
        where sensor_id = '${sensorTag}'
        order by time desc
        limit 1
      `)
    }).then(rows => {
      rows.forEach(row => console.log(`DB record: humidity is ${row.humidity}%`))
    })
  }

  const responseData = {
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    sensor_id: sensorTag
  }
  res.send(JSON.stringify(responseData));
});

app.post('/pms', (req, res) => {
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
  res.send(JSON.stringify(responseData));
});

influxDB.getDatabaseNames()
  .then(names => {
    if (!names.includes(db)) {
      return influxDB.createDatabase(db);
    }
  })
  .then(() => {
    console.log('Database exists');
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
    process.exit(1);
  })

const server = app.listen(3030, () => {
  console.log('Express server is listening on port 3030');
});
export { server };
