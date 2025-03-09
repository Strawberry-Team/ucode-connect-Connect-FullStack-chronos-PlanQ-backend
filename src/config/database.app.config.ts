// database.app.config.ts
import * as dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
function validateEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export default () => ({
    database: {
        host: validateEnv('DB_APP_HOST'),
        port: parseInt(validateEnv('DB_APP_PORT'), 10),
        username: validateEnv('DB_APP_USER'),
        password: validateEnv('DB_APP_PASSWORD'),
        name: validateEnv('DB_APP_DATABASE'),
        connectionLimit: Number(validateEnv('DB_APP_CONNECTION_LIMIT')),
    }
});

