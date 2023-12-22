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
  ]
})

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Received GET request on the path /health');
  res.send('OK');
});

app.post('/environment', (req, res) => {
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
