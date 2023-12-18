import express from 'express';
import {InfluxDB, Point} from '@influxdata/influxdb-client'

const url = process.env.INFLUX_URL
const token = process.env.INFLUX_TOKEN
const org = process.env.INFLUX_ORG
const bucket = process.env.INFLUX_BUCKET

const influxDB = new InfluxDB({url, token});

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
  const writeApi = influxDB.getWriteApi(org, bucket);
  if ('temperature' in req.body) {
    const temperaturePoint = new Point('temperature')
      .tag('sensor_id', sensorTag)
      .floatField('value', req.body.temperature)
    writeApi.writePoint(temperaturePoint)
  }
  if ('humidity' in req.body) {
    const humidityPoint = new Point('humidity')
      .tag('sensor_id', sensorTag)
      .floatField('value', req.body.humidity)
    writeApi.writePoint(humidityPoint)
  }

  writeApi.close().then(() => {
    console.log('WRITE FINISHED')
  })

  const responseData = {
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    sensor_id: sensorTag
  }
  res.send(JSON.stringify(responseData));
});

app.listen(3030, () => {
	console.log('Express server is listening on port 3030');
});

export { app };
