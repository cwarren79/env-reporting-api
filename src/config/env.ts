// Types
interface RequiredEnvVars {
    [key: string]: string;
}

interface DatabaseConfig {
    name: string;
    host: string;
    port: number;
}

interface Config {
    port: number;
    database: DatabaseConfig;
    apiKey: string;
}

// Constants
const DEFAULT_PORT = 3030;
const DEFAULT_INFLUX_PORT = 8086;

// Required environment variables and their validation
const requiredEnvVars: RequiredEnvVars = {
    INFLUX_DB: 'Database name is required',
    INFLUX_HOST: 'Database host is required',
    API_KEY: 'API key is required for authentication'
};

// Validate all required environment variables
const missingEnvVars = Object.keys(requiredEnvVars).filter(key => !process.env[key]);
if (missingEnvVars.length) {
    const messages = missingEnvVars.map(key => requiredEnvVars[key]);
    console.error('Missing required environment variables:\n', messages.join('\n'));
    process.exit(1);
}

// Export validated configuration
export const config: Config = {
    port: Number(process.env.PORT) || DEFAULT_PORT,
    database: {
        name: process.env.INFLUX_DB!,
        host: process.env.INFLUX_HOST!,
        port: Number(process.env.INFLUX_PORT) || DEFAULT_INFLUX_PORT
    },
    apiKey: process.env.API_KEY!
}; 
