import express from 'express';
const influx = require('influx');

const db = process.env.INFLUX_DB
const host = process.env.INFLUX_HOST

const influxDB = new influx.InfluxDB({
  host: host,
  port: 8086,
  database: db,
  schema: [
    {
      measurement: 'temperature',
      fields: {
        temperature: influx.FieldType.INTEGER
      },
      tags: [
        'sensor_id'
      ]
    },
    {
      measurement: 'humidity',
      fields: {
        humidity: influx.FieldType.INTEGER
      },
      tags: [
        'sensor_id'
      ]
    },
  ]
})

// influx.getDatabaseNames()
//   .then(names => {
//     if (!names.includes('express_response_db')) {
//       return influx.createDatabase('express_response_db');
//     }
//   })
//   .then(() => {
//     http.createServer(app).listen(3000, function () {
//       console.log('Listening on port 3000')
//     })
//   })
//   .catch(err => {
//     console.error(`Error creating Influx database!`);
//   })

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
  // const writeApi = influxDB.getWriteApi(org, bucket);
  if ('temperature' in req.body) {
    // const temperaturePoint = new Point('temperature')
    //   .tag('sensor_id', sensorTag)
    //   .floatField('value', req.body.temperature)
    // writeApi.writePoint(temperaturePoint)
    influxDB.writePoints([
      {
        measurement: 'temperature',
        tags: { sensor_id: sensorTag },
        fields: { 'temperature': req.body.temperature },
      }
    ]).then(() => {
      return influxDB.query(`
        select * from temperature
        where sensor_id = $sensor_id
        order by time desc
        limit 10
      `, {
        placeholders: {
          sensor_id: sensorTag
        }
      })
    }).then(rows => {
      rows.forEach(row => console.log(`temperature is ${row.temperature} C`))
    })
  }
  if ('humidity' in req.body) {
    // const humidityPoint = new Point('humidity')
    //   .tag('sensor_id', sensorTag)
    //   .floatField('value', req.body.humidity)
    // writeApi.writePoint(humidityPoint)
    influxDB.writePoints([
      {
        measurement: 'humidity',
        tags: { sensor_id: sensorTag },
        fields: { humidity: req.body.humidity },
      }
    ]).then(() => {
      return influxDB.query(`
        select * from humidity
        where sensor_id = $sensor_id
        order by time desc
        limit 10
      `, {
        placeholders: {
          sensor_id: sensorTag
        }
      })
    }).then(rows => {
      rows.forEach(row => console.log(`humidity is ${row.humidity}%`))
    })
  }

  // writeApi.close().then(() => {
  //   console.log('WRITE FINISHED')
  // })

  const responseData = {
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    sensor_id: sensorTag
  }
  res.send(JSON.stringify(responseData));
});

const server = app.listen(3030, () => {
  console.log('Express server is listening on port 3030');
});

export { server };
