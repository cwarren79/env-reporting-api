# Environment Reporting API

A Node.js API for collecting and storing environmental sensor data (temperature, humidity, and particulate matter) from remote sensors.

## Features

- Temperature and humidity data collection (DHT sensors)
- Particulate matter measurements (PMS sensors)
- InfluxDB time-series storage
- Grafana dashboard support
- API key authentication
- Docker containerization

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

## Quick Start

1. Clone the repository:

    git clone `<repository-url>`

    cd env-reporting-api

3. Create a `.env` file with required environment variables:

        INFLUX_DB=deebee
        INFLUX_HOST=influxdb
        API_KEY=your_secure_api_key_here

4. Start the services:

        docker compose up -d


The API will be available at `http://localhost:3030`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | 3030 |
| `INFLUX_DB` | InfluxDB database name | (required) |
| `INFLUX_HOST` | InfluxDB hostname | (required) |
| `INFLUX_PORT` | InfluxDB port | 8086 |
| `API_KEY` | Authentication key for API access | (required) |

## API Endpoints

### Health Check

    GET /health
    Response: 200 OK

### DHT Sensor Data

    POST /dht
    Headers: X-API-Key: <api_key>
    Body: {
        "tags": ["sensor:123"],
        "temperature": 25,
        "humidity": 60
    }

### PMS Sensor Data

    POST /pms
    Headers: X-API-Key: <api_key>
    Body: {
        "tags": ["sensor:123"],
        "pm_ug_per_m3": {
            "1.0um": 10,
            "2.5um": 20,
            "10um": 30
        },
        "pm_per_1l_air": {
            "0.3um": 5,
            "0.5um": 10,
            "1.0um": 15,
            "2.5um": 20,
            "5.0um": 25,
            "10um": 30
        }
    }

## Development

1. Install dependencies:

    npm install

2. Start development environment:

    docker compose -f docker-compose.test.yml up -d

    npm start

4. Run tests:

    npm test

## Docker Services

- **API Server**: Node.js application (port 3030)
- **InfluxDB**: Time-series database (port 8086)
- **Grafana**: Data visualization (port 3000)

## Data Schema

### InfluxDB Measurements

- `temperature`: Temperature readings in °C
- `humidity`: Relative humidity percentage
- `pm_ug_per_m3`: Particulate matter concentration
- `pm_per_1l_air`: Particle count per liter of air

All measurements include a `sensor_id` tag for identification.
